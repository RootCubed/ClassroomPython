import * as pyodide from "pyodide";

let _py: pyodide.PyodideInterface | undefined;
let pyLoadPromise: Promise<pyodide.PyodideInterface> | undefined;

async function loadPyodide() {
    const py = await pyodide.loadPyodide({
        indexURL: "/node_modules/pyodide/"
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

let stdinReceived: ((s: string) => void) | null = null;
function browserStdin() {
    return new Promise<string>((resolve) => {
        stdinReceived = (s: string) => {
            resolve(s);
        };
    });
}

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

async function handleInput(title: string, datatype: string) {
    if (runMode == "file") {
        const input = currentInput.shift();
        if (input == undefined) {
            return "";
        }
        return input;
    }

    self.postMessage({
        type: "inputReq",
        datatype,
        content: title
    });

    return await browserStdin();
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
    py.globals.set("input", async (title: string) => {
        return handleInput(title, "str");
    });
    py.globals.set("inputString", async (title: string) => {
        return handleInput(title, "str");
    });
    py.globals.set("inputInt", async (title: string) => {
        return parseInt(await handleInput(title, "int"));
    });
    py.globals.set("inputFloat", async (title: string) => {
        return parseFloat(await handleInput(title, "float"));
    });
    code = code.replace(/\binput(Int|String|Float)?\s*[(]/g, "await $&");
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
        if (error[error.length - 1].startsWith("KeyboardInterrupt")) {
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
    } else if (type === "setInterruptBuffer") {
        const py = await getPy();
        py.setInterruptBuffer(event.data.buffer);
    } else if (type == "stdinResp") {
        if (!stdinReceived) {
            throw new Error("stdinResp received without stdinRequested");
        }
        stdinReceived(event.data.buffer);
    } else {
        console.error("Unknown message type", type);
    }
};
