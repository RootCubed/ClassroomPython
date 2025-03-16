import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";

const viteServerConfig: Plugin = {
    name: "add-headers",
    configureServer: (server) => {
        server.middlewares.use((req, res, next) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            next();
        });
    }
};

export default defineConfig({
    server: {
        watch: {
            usePolling: true,
            interval: 2000
        }
    },
    plugins: [
        paraglideVitePlugin({
            project: "./project.inlang",
            outdir: "./src/lib/paraglide",
            strategy: ["localStorage", "cookie", "baseLocale"]
        }),
        sveltekit(),
        viteServerConfig
    ],
    optimizeDeps: {
        exclude: ["pyodide"]
    },
    worker: {
        format: "es"
    },
    build: {
        rollupOptions: {
            output: {
                format: "esm"
            }
        }
    },
    resolve: {
        alias: {
            // This is to support enums from Prisma with Vite
            // See https://github.com/prisma/prisma/issues/12504#issuecomment-1285883083
            ".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js"
        }
    }
});
