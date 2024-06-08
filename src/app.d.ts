import type { User } from "$lib/clpy-types";

declare global {
    namespace App {
        interface Locals {
            user: User | null;
        }
    }
}

export {};
