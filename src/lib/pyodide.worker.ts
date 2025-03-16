import * as pyodide from "pyodide";

let _py: pyodide.PyodideInterface | undefined;
let pyLoadPromise: Promise<pyodide.PyodideInterface> | undefined;

let stdinSharedBuffer: Int32Array | undefined;

async function loadPyodide() {
    let indexURL: string;
    if (process.env.NODE_ENV == "production") {
        indexURL = "/node_modules/pyodide-" + pyodide.version + "/";
    } else {
        indexURL = "/node_modules/pyodide/";
    }
    const py = await pyodide.loadPyodide({
        indexURL
    });
    return py;
}

(async () => {
    pyLoadPromise = loadPyodide();
    _py = await pyLoadPromise;
    self.postMessage({ type: "ready" });
})();

async function getPy() {
    if (!_py) {
        await pyLoadPromise;
    }
    if (!_py) {
        throw new Error("Failed to load Pyodide");
    }
    return _py;
}

let runMode: "user" | "file" = "user";
let currentInput: string[] = [];

// Remove TigerJython-specific syntax like repeat
function untiger(code: string) {
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
        let m = lines[i].match(/^(\s*)repeat ([^:]+):/);
        if (m) {
            lines[i] = `${m[1]}for _repeat_iter_${i} in range(${m[2]}):`;
        }
    }
    return lines.join("\n");
}

function handleInput(title: string, datatype: string) {
    if (runMode == "file") {
        const input = currentInput.shift();
        if (input == undefined) {
            return "";
        }
        return input;
    }

    if (!stdinSharedBuffer) {
        throw new Error("stdin buffer not set");
    }

    Atomics.store(stdinSharedBuffer, 0, -1);

    self.postMessage({
        type: "inputReq",
        datatype,
        content: title
    });

    Atomics.wait(stdinSharedBuffer, 0, -1);

    const byteCount = Atomics.load(stdinSharedBuffer, 0);
    if (byteCount == -1) {
        throw new Error("KeyboardInterrupt");
    }

    const decoder = new TextDecoder();
    // Temporary copy because decoder.decode() does not accept SharedArrayBuffer
    const tempBuffer = new ArrayBuffer(byteCount);
    const tempView = new Uint8Array(tempBuffer);
    const sharedView = new Uint8Array(stdinSharedBuffer.buffer);
    for (let i = 0; i < byteCount; i++) {
        tempView[i] = sharedView[i + 4];
    }
    return decoder.decode(tempView);
}

async function runCode(code: string) {
    const py = await getPy();
    py.setStdout({
        write: (text: Uint8Array) => {
            self.postMessage({
                type: "stdout",
                content: new TextDecoder().decode(text)
            });
            return text.length;
        }
    });
    py.setStderr({
        write: (text: Uint8Array) => {
            self.postMessage({
                type: "stderr",
                content: new TextDecoder().decode(text)
            });
            return text.length;
        }
    });
    py.globals.set("input", (title: string) => {
        return handleInput(title, "str");
    });
    py.globals.set("inputString", (title: string) => {
        return handleInput(title, "str");
    });
    py.globals.set("inputInt", (title: string) => {
        const input = handleInput(title, "int");
        try {
            return BigInt(input);
        } catch (e) {
            throw new Error("Invalid input");
        }
    });
    py.globals.set("inputFloat", (title: string) => {
        const input = handleInput(title, "float");
        try {
            return parseFloat(input);
        } catch (e) {
            throw new Error("Invalid input");
        }
    });
    code = untiger(code);
    try {
        await py.runPythonAsync(code);
    } catch (e) {
        let actualErrorStart = false;
        let error: string[] = [];
        py.setStderr({
            write: (text: Uint8Array) => {
                const textStr = new TextDecoder().decode(text);
                if (!actualErrorStart) {
                    if (textStr.includes("in <module>")) {
                        error.push("Runtime-Fehler:");
                        actualErrorStart = true;
                    } else if (textStr.includes("<exec>")) {
                        error.push("Syntax-Fehler:");
                        actualErrorStart = true;
                    }
                }
                if (actualErrorStart) {
                    error.push(textStr);
                }
                return text.length;
            }
        });
        py.runPython("import traceback;import sys;traceback.print_exception(sys.last_exc)");
        if (error[error.length - 1].includes("KeyboardInterrupt")) {
            self.postMessage({
                type: "stderr",
                content: "Das Programm wurde unterbrochen."
            });
        } else {
            for (const line of error) {
                self.postMessage({
                    type: "stderr",
                    content: line
                });
            }
        }
    }
}

self.onmessage = async (event) => {
    const { type } = event.data;

    if (type === "run") {
        runMode = event.data.inputMode;
        if (runMode == "file") {
            currentInput = event.data.inputData.split("\n");
        }
        await runCode(event.data.python);
        self.postMessage({ type: "done" });
    } else if (type == "setInterruptBuffer") {
        const py = await getPy();
        py.setInterruptBuffer(event.data.buffer);
    } else if (type == "setStdinBuffer") {
        stdinSharedBuffer = new Int32Array(event.data.buffer);
    } else {
        console.error("Unknown message type", type);
    }
};
