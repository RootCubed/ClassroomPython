import type { LayoutData as ExercisePageLayoutData } from "../routes/exercise/[id]/$types";
import type { LayoutData as ExerciseLayoutData } from "../routes/exercise/$types";

export type ExerciseView = ExercisePageLayoutData["exercise"];
export type ExerciseGroupView = ExerciseLayoutData["exercises"];
