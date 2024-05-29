import postgres from "postgres";
import "dotenv/config";

const sql = postgres({
    host: "backend",
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});

export async function setupDatabase() {
    return await sql`
        CREATE TABLE IF NOT EXISTS pages (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL
        )
    `;
}

export async function getPages() {
    return await sql`
        SELECT * FROM pages
    `;
}

export default { setupDatabase, getPages };
