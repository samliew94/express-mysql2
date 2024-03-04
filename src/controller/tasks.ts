/**
 * boilerplate
 */
import express from "express";

const app = express.Router();

export default app;

const foo: {
    username: string;
}[] = [];

app.get("/", (req, res) => {
    return res.json(foo);
});

app.post("/add", (req, res) => {
    const username = req.body.username;
    foo.push({ username });
    return res
        .status(201)
        .json({ message: `Successfully created ${username}` });
});
