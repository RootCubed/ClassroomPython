import { writable } from "svelte/store";
import type { Exercise, User } from "./clpy-types";
import * as pyodide from "pyodide";

export const loadedExercise = writable<Exercise>();
export const user = writable<User>();
