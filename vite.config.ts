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
    plugins: [sveltekit(), viteServerConfig],
    optimizeDeps: {
        exclude: ["pyodide"]
    }
});
