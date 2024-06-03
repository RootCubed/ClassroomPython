import { handler } from "./build/prod/handler.js";
import express from "express";

const app = express();
app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Cross-origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-origin-Embedder-Policy", "require-corp");

    next();
});
app.use(handler);

app.listen(3000, () => {
    console.log("listening on port 3000");
});
