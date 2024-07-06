import { writable } from "svelte/store";
import type { ClientUser } from "$lib/server/auth";
import type { ExerciseView } from "./page-types";

export const loadedExercise = writable<ExerciseView | undefined>();
export const user = writable<ClientUser>();
