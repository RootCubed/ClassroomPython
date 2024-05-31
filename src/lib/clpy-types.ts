export type Exercise = {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    group_id: string;
    template: string;
};

export type Submission = {
    id: string;
    user: { id: string; name: string; fullName: string };
    code: string;
    timestamp: Date;
};

export type ExerciseAdminView = Exercise & {
    submissions: Submission[];
};

export type ExerciseGroup = {
    id: string;
    title: string;
    exercises: Exercise[];
};
