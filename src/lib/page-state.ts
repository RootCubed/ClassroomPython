import { writable } from "svelte/store";
import type { User } from "@prisma/client";
import type { ExerciseView } from "./page-types";

export const loadedExercise = writable<ExerciseView | undefined>();
export const user = writable<User>();
