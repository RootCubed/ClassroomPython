import { writable } from "svelte/store";
import type { User } from "@prisma/client";
import type { ExerciseView } from "./server/db";

export const loadedExercise = writable<ExerciseView | undefined>();
export const user = writable<User>();
