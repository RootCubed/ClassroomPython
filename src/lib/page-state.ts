import { writable } from "svelte/store";
import type { ClientUser } from "$lib/server/auth";
import type { ExerciseView } from "./page-types";
import { DummyPyodide, type Pyodide } from "./pyodide-mgr.svelte";

export const loadedExercise = writable<ExerciseView | undefined>();
export const user = writable<ClientUser>();
export const pyodide = writable<Pyodide>(new DummyPyodide());
