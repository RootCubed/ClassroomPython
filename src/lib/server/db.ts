import postgres from "postgres";
import { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } from "$env/static/private";
import type { Exercise, ExerciseAdminView, ExerciseGroup, Submission, User } from "$lib/clpy-types";

const sql = postgres({
    host: "backend",
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB
});

export async function setupDatabase() {
    for (const table of ["clpy_user", "exercise", "exercise_group", "submission", "session"]) {
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
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255),
            description TEXT,
            template TEXT NOT NULL
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

    const uTestID = await createUser("teacher", "The Teacher", "teacher");
    const uTest2ID = await createUser("student1", "Student 1", "student");

    const gTestID = await createExerciseGroup("Test");
    const gTest2ID = await createExerciseGroup("Test 2");
    const exID = await createExercise(gTestID, {
        title: "Test Exercise",
        template: 'print("Hello, world (ex1)!")'
    });
    await createExercise(gTestID, {
        title: "Test Exercise 2",
        subtitle: "With a subtitle!",
        template: 'print("Hello, world (ex2)!")'
    });

    await createExercise(gTest2ID, {
        title: "Test Exercise",
        subtitle: "With a subtitle...",
        description: "...and a description, too!",
        template: 'print("Hello, world (ex3)!")'
    });

    await addSubmission(exID, uTestID, 'print("Goodbye, world!")');

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

export async function getUsers(): Promise<
    { id: string; username: string; fullName: string; role: "student" | "teacher" }[]
> {
    return await sql`
        SELECT * FROM clpy_user;
    `;
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

export async function getExercise(id: string): Promise<Exercise> {
    const [exercise] = await sql`
        SELECT * FROM exercise WHERE id = ${id};
    `;

    return {
        id: exercise.id,
        title: exercise.title,
        subtitle: exercise.subtitle,
        description: exercise.description,
        group_id: exercise.group_id,
        template: exercise.template
    };
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
        WHERE submission.exercise_id = ${id};
    `;

    console.log(await sql`SELECT * FROM submission;`);

    return {
        id: exercise.id,
        title: exercise.title,
        subtitle: exercise.subtitle,
        description: exercise.description,
        group_id: exercise.group_id,
        template: exercise.template,
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

export async function getExercises(): Promise<ExerciseGroup[]> {
    const exercises = await sql`
        SELECT * FROM exercise;
    `;

    const groups = await sql`
        SELECT * FROM exercise_group;
    `;

    console.log(exercises);

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
                    template: e.template
                }))
        };
    });
}