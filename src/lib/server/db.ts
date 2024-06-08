import postgres from "postgres";
import { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } from "$env/static/private";
import {
    SubmissionStatus,
    type Exercise,
    type ExerciseAdminView,
    type ExerciseGroup,
    type Submission,
    type User
} from "$lib/clpy-types";

const sql = postgres({
    host: "backend",
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB
});

export async function setupDatabase() {
    for (const table of [
        "clpy_user",
        "exercise",
        "exercise_group",
        "submission",
        "save",
        "session"
    ]) {
        try {
            await sql`DROP TABLE ${sql(table)} CASCADE;`;
        } catch (error) {
            console.log(`Table ${table} does not exist`);
        }
    }

    try {
        await sql`
            CREATE TYPE role AS ENUM ('student', 'teacher');
        `;
    } catch (error) {
        console.log("Role type already exists");
    }

    await sql`
        CREATE TABLE clpy_user (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(255) UNIQUE,
            full_name VARCHAR(255),
            role ROLE NOT NULL
        );
        CREATE TABLE exercise_group (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL
        );
        CREATE TABLE exercise (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            group_id UUID REFERENCES exercise_group(id),
            order_num SERIAL NOT NULL,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255),
            description TEXT,
            template TEXT NOT NULL
        );
        CREATE TABLE save (
            user_id UUID REFERENCES clpy_user(id),
            exercise_id UUID REFERENCES exercise(id),
            code TEXT NOT NULL,
            PRIMARY KEY (user_id, exercise_id)
        );
        CREATE TABLE submission (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES clpy_user(id),
            exercise_id UUID REFERENCES exercise(id),
            code TEXT NOT NULL,
            score INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE session (
            session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES clpy_user(id)
        )
    `.simple();

    console.log("Database setup complete");
}

export async function loginUser(username: string): Promise<string> {
    const [user] = await sql`
        SELECT id
        FROM clpy_user
        WHERE username = ${username};
    `;
    if (!user) {
        throw new Error("User does not exist");
    }
    const [{ session_id }] = await sql`
        INSERT INTO session (user_id)
        VALUES (${user.id})
        RETURNING session_id;
    `;
    return session_id;
}

export async function invalidateSession(sessionToken: string): Promise<void> {
    await sql`
        DELETE FROM session
        WHERE session_id = ${sessionToken};
    `;
}

export async function checkSession(sessionToken: string): Promise<User | null> {
    const [user] = await sql`
        SELECT clpy_user.*
        FROM session
        JOIN clpy_user
        ON session.user_id = clpy_user.id
        WHERE session_id = ${sessionToken};
    `;
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        name: user.username,
        fullName: user.full_name,
        isAdmin: user.role === "teacher"
    };
}

export async function deleteAllUsers(): Promise<void> {
    await sql`
        DELETE FROM submission;
        DELETE FROM session;
        DELETE FROM clpy_user;
    `.simple();
}

export async function createUser(
    name: string,
    fullName: string,
    role: "student" | "teacher"
): Promise<string> {
    const [{ id }] = await sql`
        INSERT INTO clpy_user (username, full_name, role)
        VALUES (${name}, ${fullName}, ${role})
        RETURNING id;
    `;
    return id;
}

export async function createExerciseGroup(title: string): Promise<string> {
    const [{ id }] = await sql`
        INSERT INTO exercise_group (title)
        VALUES (${title})
        RETURNING id;
    `;
    return id;
}

export async function getExerciseGroup(title: string, createIfNotExist: boolean): Promise<string> {
    const [existingGroup] = await sql`
        SELECT id FROM exercise_group WHERE title = ${title};
    `;
    if (existingGroup) {
        return existingGroup.id;
    } else if (!createIfNotExist) {
        throw new Error("Group does not exist");
    }

    return await createExerciseGroup(title);
}

export async function createExercise(
    group: string,
    exercise: {
        title: string;
        subtitle?: string;
        description?: string;
        template: string;
    }
): Promise<string> {
    const sqlSubtitle = exercise.subtitle ?? null;
    const sqlDescription = exercise.description ?? null;
    const [{ id }] = await sql`
        INSERT INTO exercise (group_id, title, subtitle, description, template)
        VALUES (${group}, ${exercise.title}, ${sqlSubtitle}, ${sqlDescription}, ${exercise.template})
        RETURNING id;
    `;
    return id;
}

export async function getUsers(): Promise<User[]> {
    const rawUsers = await sql`
        SELECT * FROM clpy_user;
    `;
    return rawUsers.map((row) => ({
        id: row.id,
        name: row.username,
        fullName: row.full_name,
        isAdmin: row.role === "teacher"
    }));
}

export async function addSubmission(
    exerciseID: string,
    userID: string,
    code: string
): Promise<string> {
    const [{ id }] = await sql`
        INSERT INTO submission (exercise_id, user_id, code)
        VALUES (${exerciseID}, ${userID}, ${code})
        RETURNING id;
    `;
    return id;
}

export async function getExercise(id: string, userId: string): Promise<Exercise> {
    const [exercise] = await sql`
        SELECT *, save.code AS save_code
        FROM exercise
        LEFT JOIN save
        ON exercise.id = save.exercise_id AND save.user_id = ${userId}
        WHERE id = ${id};
    `;

    const [{ count }] = await sql`
        SELECT COUNT(*) FROM submission WHERE exercise_id = ${id} AND user_id = ${userId};
    `;

    return {
        id: exercise.id,
        title: exercise.title,
        subtitle: exercise.subtitle,
        description: exercise.description,
        group_id: exercise.group_id,
        template: exercise.template,
        code: exercise.save_code === null ? exercise.template : exercise.save_code,
        submissionStatus:
            parseInt(count) === 0 ? SubmissionStatus.NotSubmitted : SubmissionStatus.Submitted
    };
}

export async function getExerciseSave(exerciseID: string, userID: string): Promise<string | null> {
    const [save] = await sql`
        SELECT code
        FROM save
        WHERE exercise_id = ${exerciseID} AND user_id = ${userID};
    `;
    return save?.code ?? null;
}

export async function saveExercise(
    exerciseID: string,
    userID: string,
    code: string
): Promise<void> {
    await sql`
        INSERT INTO save (user_id, exercise_id, code)
        VALUES (${userID}, ${exerciseID}, ${code})
        ON CONFLICT (user_id, exercise_id) DO UPDATE
        SET code = ${code};
    `;
}

export async function adminGetExercise(id: string): Promise<ExerciseAdminView> {
    const [exercise] = await sql`
        SELECT * FROM exercise WHERE id = ${id};
    `;

    const submissions = await sql`
        SELECT submission.*, clpy_user.*
        FROM submission
        LEFT JOIN clpy_user
        ON submission.user_id = clpy_user.id
        WHERE submission.exercise_id = ${id}
        ORDER BY submission.timestamp DESC;
    `;

    return {
        id: exercise.id,
        title: exercise.title,
        subtitle: exercise.subtitle,
        description: exercise.description,
        group_id: exercise.group_id,
        template: exercise.template,
        code: exercise.template,
        submissionStatus: SubmissionStatus.Submitted,
        submissions: submissions.map((submission) => ({
            id: submission.id,
            user: {
                id: submission.user_id,
                name: submission.username,
                fullName: submission.full_name,
                isAdmin: submission.role === "teacher"
            },
            code: submission.code,
            timestamp: new Date(submission.timestamp)
        }))
    };
}

export async function getSubmission(id: string): Promise<Submission> {
    const [submission] = await sql`
        SELECT * FROM submission WHERE id = ${id};
    `;

    return {
        id: submission.id,
        user: submission.user_id,
        code: submission.code,
        timestamp: new Date(submission.timestamp)
    };
}

export async function getExercises(userId: string): Promise<ExerciseGroup[]> {
    const exercises = await sql`
        SELECT exercise.*, save.code AS save_code, COUNT(submission.id) AS submission_count
        FROM exercise
        LEFT JOIN save
        ON exercise.id = save.exercise_id AND save.user_id = ${userId}
        LEFT JOIN submission
        ON exercise.id = submission.exercise_id AND submission.user_id = ${userId}
        GROUP BY exercise.id, exercise.title, save.code
        ORDER BY exercise.order_num ASC;
    `;

    const groups = await sql`
        SELECT * FROM exercise_group;
    `;

    return groups.map((group) => {
        return {
            title: group.title,
            id: group.id,
            exercises: exercises
                .filter((exercise) => exercise.group_id === group.id)
                .map((e) => ({
                    id: e.id,
                    title: e.title,
                    subtitle: e.subtitle,
                    description: e.description,
                    group_id: e.group_id,
                    template: e.template,
                    code: e.save_code === null ? e.template : e.save_code,
                    submissionStatus:
                        parseInt(e.submission_count) === 0
                            ? SubmissionStatus.NotSubmitted
                            : SubmissionStatus.Submitted
                }))
        };
    });
}

export async function saveLastSubmissions(): Promise<void> {
    const exercises = await sql`
        SELECT id FROM exercise;
    `;
    for (const exercise of exercises) {
        const submissions = await sql`
            SELECT user_id, code
            FROM submission
            WHERE exercise_id = ${exercise.id}
            ORDER BY timestamp DESC;
        `;
        for (const submission of submissions) {
            const trySave = await sql`
                SELECT * FROM save
                WHERE user_id = ${submission.user_id} AND exercise_id = ${exercise.id};
            `;
            if (trySave.length > 0) {
                continue;
            }
            console.log(
                `Saving submission for exercise ${exercise.id} by user ${submission.user_id}`
            );
            await saveExercise(exercise.id, submission.user_id, submission.code);
        }
    }
}
