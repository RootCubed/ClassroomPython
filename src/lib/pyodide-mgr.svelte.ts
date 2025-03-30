export interface ConsoleOutput {
    type: "stdout" | "stderr" | "extra";
    text: string;
}

export interface Pyodide {
    ready: boolean;
    runCode(
        code: string,
        inputMode: "user" | "file",
        inputData: string,
        consoleOutput: ConsoleOutput[]
    ): Promise<void>;
    interrupt(code: number): void;
}

export class DummyPyodide implements Pyodide {
    ready = false;
    constructor() {}
    async runCode() {}
    interrupt() {}
}

export class WebWorkerPyodide implements Pyodide {
    private pyodide: Worker;
    private interruptBuffer: SharedArrayBuffer;
    private stdinBuffer: SharedArrayBuffer;
    private isCancelling = false;
    private receiveMessages = true;
    public ready = $state(false);
    private codeFinishedCb: () => void = () => {};
    private consoleOutputRef: ConsoleOutput[] = [];

    constructor(worker: Worker) {
        this.pyodide = worker;
        this.interruptBuffer = new SharedArrayBuffer(1);
        this.stdinBuffer = new SharedArrayBuffer(32 * 1024); // 32 KiB buffer for stdin

        this.pyodide.addEventListener("message", (ev) => {
            if (ev.data.type == "ready") {
                this.ready = true;
                this.pyodide.postMessage({
                    type: "setInterruptBuffer",
                    buffer: this.interruptBuffer
                });
                this.pyodide.postMessage({
                    type: "setStdinBuffer",
                    buffer: this.stdinBuffer
                });
            } else if (ev.data.type == "done") {
                this.codeFinishedCb();
            } else if (ev.data.type == "inputReq") {
                // TODO: Use a nicer prompt box
                const response = prompt(ev.data.content);
                const notify = new Int32Array(this.stdinBuffer);
                const bufView = new Int8Array(this.stdinBuffer);
                if (response != null) {
                    const dataBytes = new TextEncoder().encode(response);
                    bufView.set(dataBytes, 4);
                    Atomics.store(notify, 0, dataBytes.length);
                } else {
                    Atomics.store(notify, 0, -1);
                }
                Atomics.notify(notify, 0);
            } else {
                if (this.receiveMessages) {
                    if (this.isCancelling) {
                        this.consoleOutputRef.push({
                            type: "stderr",
                            text: "Das Programm wurde unterbrochen."
                        });
                        this.receiveMessages = false;
                    } else {
                        this.consoleOutputRef.push({
                            type: ev.data.type,
                            text: ev.data.content
                        });
                    }
                }
            }
        });
    }

    async runCode(
        code: string,
        inputMode: "user" | "file",
        inputData: string,
        consoleOutput: ConsoleOutput[]
    ): Promise<void> {
        this.isCancelling = false;
        this.receiveMessages = true;
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
        this.isCancelling = true;
        new Uint8Array(this.interruptBuffer)[0] = code;
    }

    registerCallback(callback: (ev: MessageEvent) => void) {
        this.pyodide.addEventListener("message", callback);
    }
}
