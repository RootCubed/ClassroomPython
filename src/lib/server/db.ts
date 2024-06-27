import { PrismaClient } from "@prisma/client";
import type { Exercise, ExerciseGroup, Prisma, Role, Submission, User } from "@prisma/client";
import {
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_USER
} from "$env/static/private";

const datasourceUrl = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;

const prisma = new PrismaClient({
    datasourceUrl
});

export async function resetAllExceptUsers(): Promise<void> {
    const deleteTransactions = [
        prisma.submission.deleteMany(),
        prisma.save.deleteMany(),
        prisma.exercise.deleteMany(),
        prisma.exerciseGroup.deleteMany()
    ];

    await prisma.$transaction(deleteTransactions);
}

export async function resetUsers(): Promise<void> {
    const deleteTransactions = [prisma.session.deleteMany(), prisma.user.deleteMany()];

    await prisma.$transaction(deleteTransactions);
}

export async function loginUser(userName: string): Promise<string> {
    const user = await prisma.user.findUnique({
        where: { userName }
    });
    if (!user) {
        throw new Error("User does not exist");
    }
    const session = await prisma.session.create({
        data: {
            userId: user.id
        }
    });
    return session.id;
}

export async function invalidateSession(sessionToken: string): Promise<void> {
    await prisma.session.delete({
        where: { id: sessionToken }
    });
}

export async function checkSession(sessionToken: string): Promise<User | null> {
    const session = await prisma.session.findUnique({
        where: { id: sessionToken },
        include: { user: true }
    });
    if (!session) {
        return null;
    }
    return session.user;
}

export async function createUser(userName: string, fullName: string, role: Role): Promise<string> {
    const user = await prisma.user.create({
        data: {
            userName,
            fullName,
            role,
            passwordHash: ""
        }
    });
    return user.id;
}

export async function createExerciseGroup(courseId: string, title: string): Promise<ExerciseGroup> {
    const group = await prisma.exerciseGroup.create({
        data: {
            title,
            courseId
        }
    });
    return group;
}

export async function getExerciseGroup(id: string): Promise<ExerciseGroup | null> {
    const group = await prisma.exerciseGroup.findUnique({
        where: { id }
    });
    if (!group) {
        return null;
    }
    return group;
}

export async function createExercise(
    groupId: string,
    title: string,
    subtitle: string | null,
    description: string | null,
    codeTemplate: string
): Promise<Exercise> {
    const exercise = await prisma.exercise.create({
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

export async function getUsers(): Promise<User[]> {
    return prisma.user.findMany();
}

export async function addSubmission(
    exerciseId: string,
    userId: string,
    code: string
): Promise<Submission> {
    const submission = await prisma.submission.create({
        data: {
            exerciseId,
            userId,
            code
        }
    });
    return submission;
}

async function getExerciseInternal(id: string, userId: string) {
    const exercise = await prisma.exercise.findUnique({
        where: { id },
        include: {
            saves: { where: { userId } },
            submissions: { where: { userId } },
            exerciseGroup: true
        }
    });
    if (!exercise) {
        throw new Error("Exercise not found");
    }
    return exercise;
}

export async function getExercise(id: string, userId: string) {
    try {
        return await getExerciseInternal(id, userId);
    } catch (e) {
        return null;
    }
}

export type ExerciseView = Prisma.PromiseReturnType<typeof getExerciseInternal>;

export async function getExerciseSave(exerciseId: string, userId: string): Promise<string | null> {
    const save = await prisma.save.findFirst({
        where: { exerciseId, userId }
    });
    return save?.code ?? null;
}

export async function saveExercise(
    exerciseId: string,
    userId: string,
    code: string
): Promise<void> {
    await prisma.save.upsert({
        where: { userId_exerciseId: { exerciseId, userId } },
        create: { exerciseId, userId, code },
        update: { code }
    });
}

export async function getSubmission(id: string): Promise<Submission | null> {
    const submission = await prisma.submission.findUnique({
        where: { id }
    });
    if (!submission) {
        return null;
    }
    return submission;
}

export async function getSubmissions(exerciseId: string): Promise<Submission[]> {
    return prisma.submission.findMany({
        where: { exerciseId }
    });
}

export async function adminGetExercise(id: string) {
    const exercise = await prisma.exercise.findUnique({
        where: { id },
        include: {
            submissions: { include: { user: true } }
        }
    });
    if (!exercise) {
        return null;
    }
    return exercise;
}

export type AdminExerciseView = Prisma.PromiseReturnType<typeof adminGetExercise>;

export async function getExercises(/* courseId: string, */ userId: string) {
    const exercises = await prisma.exerciseGroup.findMany({
        // where: { groupId: courseId },
        include: {
            exercises: {
                include: {
                    saves: { where: { userId } },
                    submissions: { where: { userId } },
                    exerciseGroup: true
                }
            }
        }
    });
    return exercises;
}

export type ExerciseGroupView = Prisma.PromiseReturnType<typeof getExercises>;
