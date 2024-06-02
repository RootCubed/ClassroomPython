import * as pyodide from "pyodide";

let _py: pyodide.PyodideInterface | undefined;
_py = await getPy();

self.postMessage({ type: "ready" });

async function getPy() {
    if (_py) {
        return _py;
    }
    _py = await pyodide.loadPyodide();
    return _py;
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
    try {
        py.runPython(code);
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
        await runCode(event.data.python);
        self.postMessage({ type: "done" });
    } else if (type === "setInterruptBuffer") {
        const py = await getPy();
        py.setInterruptBuffer(event.data.buffer);
    } else {
        console.error("Unknown message type", type);
    }
};
