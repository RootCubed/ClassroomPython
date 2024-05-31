import { writable } from "svelte/store";
import type { Exercise } from "./clpy-types";
import * as pyodide from "pyodide";

export const loadedExercise = writable<Exercise>();
export const user = writable<{ id: string; name: string; fullName: string; isAdmin: boolean }>();
export const py = writable<pyodide.PyodideInterface | undefined>();
