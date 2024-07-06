import type { ClientUser } from "$lib/server/auth";

declare global {
    namespace App {
        interface Locals {
            user: ClientUser | null;
        }
    }
}

export {};
