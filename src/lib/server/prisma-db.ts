import { PrismaClient } from "@prisma/client";

import {
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_USER
} from "$env/static/private";

const datasourceUrl = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;

const db = new PrismaClient({
    datasourceUrl
});

export default db;
