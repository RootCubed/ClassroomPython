import type { AvailableLanguageTag } from "$lib/paraglide/runtime";
import type { ParaglideLocals } from "@inlang/paraglide-sveltekit";
import type { ClientUser } from "$lib/server/auth";

declare global {
    namespace App {
        interface Locals {
            paraglide: ParaglideLocals<AvailableLanguageTag>;

            user: ClientUser | null;
            isSEB: boolean;
        }
    }
}

export {};
