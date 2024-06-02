export type User = {
    id: string;
    name: string;
    fullName: string;
    isAdmin: boolean;
};

export enum SubmissionStatus {
    NotSubmitted = "not_submitted",
    Submitted = "submitted",
    Accepted = "accepted"
}

export type Exercise = {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    group_id: string;
    template: string;
    code: string;
    submissionStatus: SubmissionStatus;
};

export type Submission = {
    id: string;
    user: User;
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
