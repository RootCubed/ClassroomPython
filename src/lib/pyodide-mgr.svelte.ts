export interface ConsoleOutput {
    type: "stdout" | "stderr" | "extra";
    text: string;
}

export class Pyodide {
    private pyodide: Worker;
    private interruptBuffer: Uint8Array;
    public ready = $state(false);
    private codeFinishedCb: () => void = () => {};
    private consoleOutputRef: ConsoleOutput[] = [];

    constructor(worker: Worker) {
        this.pyodide = worker;
        this.interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));

        this.pyodide.addEventListener("message", (ev) => {
            if (ev.data.type == "ready") {
                this.ready = true;
                this.pyodide.postMessage({
                    type: "setInterruptBuffer",
                    buffer: this.interruptBuffer
                });
            } else if (ev.data.type == "done") {
                this.codeFinishedCb();
            } else if (ev.data.type == "inputReq") {
                // TODO: Use a nicer prompt box
                const response = prompt(ev.data.content);
                this.pyodide.postMessage({
                    type: "stdinResp",
                    buffer: response
                });
            } else {
                this.consoleOutputRef.push({
                    type: ev.data.type,
                    text: ev.data.content
                });
            }
        });
    }

    async runCode(
        code: string,
        inputMode: "user" | "file",
        inputData: string,
        consoleOutput: ConsoleOutput[]
    ): Promise<void> {
        this.consoleOutputRef = consoleOutput;
        this.pyodide.postMessage({
            type: "run",
            python: code,
            inputMode,
            inputData
        });
        return new Promise((resolve) => {
            this.codeFinishedCb = () => {
                resolve();
            };
        });
    }

    interrupt(code: number = 0) {
        this.interruptBuffer[0] = code;
    }

    registerCallback(callback: (ev: MessageEvent) => void) {
        this.pyodide.addEventListener("message", callback);
    }
}
