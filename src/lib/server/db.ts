import type { Exercise, ExerciseGroup, Prisma, Role, Submission, User } from "@prisma/client";
import db from "./prisma-db";

export async function isInitialized(): Promise<boolean> {
    const numAdmins = await db.user.count({
        where: { role: "ADMIN" }
    });
    return numAdmins > 0;
}

export async function resetAllExceptUsers(): Promise<void> {
    const deleteTransactions = [
        db.submission.deleteMany(),
        db.save.deleteMany(),
        db.exercise.deleteMany(),
        db.exerciseGroup.deleteMany()
    ];

    await db.$transaction(deleteTransactions);
}

export async function resetUsers(): Promise<void> {
    const deleteTransactions = [db.session.deleteMany(), db.user.deleteMany()];

    await db.$transaction(deleteTransactions);
}

export async function createExerciseGroup(courseId: string, title: string): Promise<ExerciseGroup> {
    const group = await db.exerciseGroup.create({
        data: {
            title,
            courseId
        }
    });
    return group;
}

export async function createExercise(
    groupId: string,
    title: string,
    subtitle: string | null,
    description: string | null,
    codeTemplate: string
): Promise<Exercise> {
    const exercise = await db.exercise.create({
        data: {
            groupId,
            title,
            subtitle,
            description,
            codeTemplate,
            isInLibrary: false
        }
    });
    return exercise;
}

export async function addSubmission(
    exerciseId: string,
    userId: string,
    code: string
): Promise<Submission> {
    const submission = await db.submission.create({
        data: {
            exerciseId,
            userId,
            code
        }
    });
    return submission;
}

export async function getExerciseSave(exerciseId: string, userId: string): Promise<string | null> {
    const save = await db.save.findFirst({
        where: { exerciseId, userId }
    });
    return save?.code ?? null;
}

export async function saveExercise(
    exerciseId: string,
    userId: string,
    code: string
): Promise<void> {
    await db.save.upsert({
        where: { userId_exerciseId: { exerciseId, userId } },
        create: { exerciseId, userId, code },
        update: { code }
    });
}

export async function getSubmission(id: string): Promise<Submission | null> {
    const submission = await db.submission.findUnique({
        where: { id }
    });
    if (!submission) {
        return null;
    }
    return submission;
}

export async function getSubmissions(exerciseId: string): Promise<Submission[]> {
    return db.submission.findMany({
        where: { exerciseId }
    });
}
