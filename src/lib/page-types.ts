import type { LayoutData as ExercisePageLayoutData } from "../routes/course/[courseID]/exercise/[exerciseID]/$types";
import type { LayoutData as ExerciseLayoutData } from "../routes/course/[courseID]/$types";

export type ExerciseView = ExercisePageLayoutData["exercise"];
export type ExerciseGroupView = ExerciseLayoutData["exercises"];
