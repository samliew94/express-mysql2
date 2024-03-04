import express from "express";
import mysql from "../mysql/mysql-config";
import { v4 as uuidv4 } from 'uuid';

const app = express.Router();

export default app;

app.post("/reset", async (req, res) => {

    return res.json();
});

