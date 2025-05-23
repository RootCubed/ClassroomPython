<script lang="ts">
    import { beforeNavigate, goto, invalidateAll } from "$app/navigation";

    import * as Resizable from "$lib/components/ui/resizable";
    import * as AlertDialog from "$lib/components/ui/alert-dialog";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import Input from "$lib/components/ui/input/input.svelte";
    import type { PaneAPI } from "paneforge";
    import { toast } from "svelte-sonner";
    import { cn } from "$lib/utils";

    import { PanelRightOpen } from "@lucide/svelte";

    import { user, pyodide } from "./page-state";
    import type { ExerciseView } from "./page-types";
    import type { ConsoleOutput } from "./pyodide-mgr.svelte";
    import AceEditor from "./AceEditor.svelte";
    import CodeWindowSidebar from "./CodeWindowSidebar.svelte";
    import Console from "./Console.svelte";
    import LoadingSpinner from "./LoadingSpinner.svelte";
    import Toolbar from "./Toolbar.svelte";

    import * as m from "$lib/paraglide/messages";

    type CodeWindowExerciseView = Omit<ExerciseView, "submissions" | "exerciseGroup">;
    type InputSource = "userInput" | "fileInput" | "runAll";

    interface Props {
        exercise: CodeWindowExerciseView;
        exerciseURL: string;
        mode?: "USER" | "SUBMISSION_VIEW" | "EDIT";
        submitAs?: string;
    }

    let { exercise: _ex, exerciseURL, mode = "USER", submitAs }: Props = $props();

    let exercise = $state(_ex);
    let lastSavedCode = getCode(_ex);

    let isEditing = $derived(mode == "EDIT");

    let codeEditor: AceEditor;

    let collapsed = $state(false);
    let detailsPane: PaneAPI | undefined = $state(undefined);

    let currTestcaseNum = $state(0);
    let failedTestcaseNum: null | number = null;
    let failedConsoleOutput: ConsoleOutput[] = [];
    let inputSource: InputSource = $state("userInput");

    let leaveConfirmWindow = $state({
        open: false,
        destination: ""
    });

    let submitDialogState = $state({
        open: false,
        resultReady: false,
        score: 0
    });

    let consoleOutput: ConsoleOutput[] = $state([]);
    let runReady = $derived($pyodide.ready);

    function getCode(exercise: CodeWindowExerciseView) {
        return exercise.save?.code ?? exercise.codeTemplate;
    }

    function clearResults() {
        for (let i = 0; i < exercise.testcases.length; i++) {
            exercise.testcases[i].testcaseResult = null;
        }
    }

    async function runCode(inputSource: InputSource, userTriggered: boolean, ignoreFail = false) {
        if (inputSource == "runAll" && userTriggered) {
            submitDialogState.resultReady = false;
            currTestcaseNum = 0;
            failedTestcaseNum = null;
            clearResults();
        }
        $pyodide.interrupt(0);

        consoleOutput = [];
        const inputMode = inputSource == "userInput" ? "user" : "file";
        if (exercise.testcases.length == 0) {
            await $pyodide.runCode(codeEditor.getValue(), inputMode, "", consoleOutput);
            if (inputSource == "runAll") {
                submitDialogState.resultReady = true;
                submitDialogState.score = 0;
                return;
            }
        } else {
            await $pyodide.runCode(
                codeEditor.getValue(),
                inputMode,
                exercise.testcases[currTestcaseNum]?.input,
                consoleOutput
            );
        }

        if (inputSource == "userInput") {
            return;
        }
        const currentTest = exercise.testcases[currTestcaseNum];
        const actualOutput = consoleOutput.map((x) => x.text).join("\n");
        const correctOutput = currentTest.expectedOutput.trim() == actualOutput.trim();
        const res = {
            testcaseId: currentTest.id,
            userId: $user.id,
            passed: correctOutput
        };
        currentTest.testcaseResult = res;
        consoleOutput.push({
            type: correctOutput ? "extra" : "stderr",
            text: correctOutput ? "[OK]" : "[FAIL]"
        });
        if (!correctOutput && !ignoreFail) {
            return;
        }
        if (!correctOutput) {
            failedConsoleOutput = consoleOutput;
            failedTestcaseNum = currTestcaseNum;
        }
        if (inputSource == "runAll") {
            if (currTestcaseNum < exercise.testcases.length) {
                currTestcaseNum++;
            }
            if (currTestcaseNum < exercise.testcases.length) {
                await runCode(inputSource, false, ignoreFail);
            } else {
                if (failedTestcaseNum != null) {
                    consoleOutput = failedConsoleOutput;
                    currTestcaseNum = failedTestcaseNum;
                }
                submitDialogState.resultReady = true;
                submitDialogState.score = exercise.testcases.filter(
                    (x) => x.testcaseResult?.passed
                ).length;
            }
        } else if (currTestcaseNum < exercise.testcases.length - 1) {
            currTestcaseNum++;
        }
    }

    async function cancelExecution() {
        $pyodide.interrupt(2);
    }

    async function triggerSubmitFlow() {
        submitDialogState.open = true;
        runCode("runAll", true, true);
    }

    async function submitCode() {
        if (!exerciseURL) {
            console.error("No submission ID");
            return;
        }
        const submitReq = fetch(`${exerciseURL}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: JSON.stringify({
                code: codeEditor.getValue(),
                testcaseResults: exercise.testcases.map((x) => ({
                    id: x.id,
                    passed: x.testcaseResult?.passed
                })),
                submitAs
            })
        });
        toast.promise(submitReq, {
            loading: m.code_submit_toast_in_progress(),
            success: () => {
                lastSavedCode = codeEditor.getValue();
                invalidateAll();
                return m.code_submit_toast_success();
            },
            error: m.code_submit_toast_error()
        });
    }

    async function saveCode() {
        let resp: Response;
        resp = await fetch(`${exerciseURL}/save`, {
            method: "POST",
            body: codeEditor.getValue()
        });
        exercise.save = { userId: "", exerciseId: "", code: codeEditor.getValue() };
        if (resp.ok) {
            lastSavedCode = codeEditor.getValue();
        } else {
            toast.error(m.code_save_toast_error());
        }
    }

    async function adminSave() {
        const req = fetch(`${exerciseURL}/admin-save`, {
            method: "POST",
            body: JSON.stringify({
                description: exercise.description,
                codeTemplate: codeEditor.getValue(),
                title: exercise.title,
                subtitle: exercise.subtitle,
                testcases: exercise.testcases
            })
        });
        toast.promise(req, {
            loading: m.code_admin_save_toast_in_progress(),
            success: () => {
                lastSavedCode = codeEditor.getValue();
                invalidateAll();
                return m.code_admin_save_toast_success();
            },
            error: m.code_admin_save_toast_error()
        });
    }

    async function resetCode() {
        await fetch(`${exerciseURL}/save`, {
            method: "DELETE"
        });
        exercise.save = null;
        codeEditor.setValue(exercise.codeTemplate);
        lastSavedCode = exercise.codeTemplate;
    }

    beforeNavigate(async (navigation) => {
        if (codeEditor.getValue() != lastSavedCode && !leaveConfirmWindow.open) {
            if (!navigation.willUnload && navigation.to?.url.toString() != window.location.href) {
                leaveConfirmWindow.open = true;
                leaveConfirmWindow.destination = navigation.to?.url.toString() ?? "#";
            }
            navigation.cancel();
        }
    });
</script>

<AlertDialog.Root bind:open={leaveConfirmWindow.open}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>{m.code_unsaved_changes_title()}</AlertDialog.Title>
            <AlertDialog.Description>
                {m.code_unsaved_changes_subtitle()}
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>Abbrechen</AlertDialog.Cancel>
            <AlertDialog.Action onclick={() => goto(leaveConfirmWindow.destination)}
                >{m.code_unsaved_changes_continue_without()}</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<AlertDialog.Root bind:open={submitDialogState.open}>
    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>{m.code_submit_dialog_title()}</AlertDialog.Title>
            <AlertDialog.Description class="text-white">
                {#if exercise.testcases.length > 0}
                    <h2 class="text-lg">{m.code_submit_dialog_results_title()}</h2>
                    <div class="flex flex-row gap-px overflow-hidden rounded-md">
                        {#each exercise.testcases as testcase, i}
                            <div
                                class={cn(
                                    "flex h-8 flex-1 items-center justify-center text-white",
                                    testcase.testcaseResult == null
                                        ? "bg-zinc-600"
                                        : testcase.testcaseResult.passed
                                          ? "bg-green-600"
                                          : "bg-red-600"
                                )}
                            >
                                {#if testcase.testcaseResult == null}
                                    <LoadingSpinner />
                                {:else}
                                    <span>{i + 1}</span>
                                {/if}
                            </div>
                        {/each}
                    </div>
                    {#if submitDialogState.resultReady}
                        <p class="mt-2">
                            {m.code_submit_dialog_results_message({
                                result: `${submitDialogState.score}/${exercise.testcases.length}`
                            })}
                        </p>

                        <p class="mt-2">
                            {m.code_submit_confirm()}
                        </p>
                    {/if}
                {:else}
                    <p>{m.code_submit_dialog_no_testcases()}</p>
                {/if}
            </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
            <AlertDialog.Cancel>{m.global_cancel()}</AlertDialog.Cancel>
            <AlertDialog.Action
                onclick={() => {
                    submitDialogState.resultReady = false;
                    submitCode().then(() => {
                        submitDialogState.open = false;
                    });
                }}
                disabled={!submitDialogState.resultReady}>{m.global_submit()}</AlertDialog.Action
            >
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>

<Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane>
        <Resizable.PaneGroup direction="vertical">
            <Resizable.Pane>
                <div class="flex h-full flex-col gap-2">
                    <div class="flex flex-row justify-between">
                        {#if !isEditing}
                            <Toolbar
                                {runReady}
                                onExecute={() => runCode(inputSource, true)}
                                onCancel={cancelExecution}
                                onSave={saveCode}
                                onSubmit={triggerSubmitFlow}
                                onReset={resetCode}
                                hasTestcases={exercise.testcases.length > 0}
                                {currTestcaseNum}
                                bind:inputSource
                            />
                        {:else}
                            <div class="flex w-full items-center justify-between gap-2 px-2">
                                <div>
                                    <Label for="edit-title">Titel</Label>
                                    <Input id="edit-title" bind:value={exercise.title} />
                                </div>
                                <div>
                                    <Label for="edit-subtitle">Untertitel</Label>
                                    <Input id="edit-subtitle" bind:value={exercise.subtitle} />
                                </div>

                                <Button variant="ghost" type="submit" onclick={adminSave}
                                    >{m.global_save()}</Button
                                >
                            </div>
                        {/if}
                        {#if detailsPane?.isCollapsed()}
                            <Button
                                class="mr-2 h-full"
                                variant="ghost"
                                onclick={detailsPane?.expand}
                            >
                                <PanelRightOpen />
                            </Button>
                        {/if}
                    </div>
                    <AceEditor initialValue={getCode(exercise)} bind:this={codeEditor} />
                </div>
            </Resizable.Pane>
            <Resizable.Handle withHandle />
            <Resizable.Pane defaultSize={20}>
                <Console {consoleOutput} />
            </Resizable.Pane>
        </Resizable.PaneGroup>
    </Resizable.Pane>
    <Resizable.Handle withHandle={!detailsPane?.isCollapsed()} />
    <Resizable.Pane
        collapsible={true}
        defaultSize={50}
        minSize={15}
        collapsedSize={0}
        bind:this={detailsPane}
    >
        {#if !collapsed}
            <CodeWindowSidebar bind:currTestcaseNum bind:exercise editMode={isEditing} />
        {/if}
    </Resizable.Pane>
</Resizable.PaneGroup>
