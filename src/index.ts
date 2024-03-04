import express from "express";
import users from "./controller/users";
import dotenv from "dotenv";
import content from "./controller/content";
import init from "./controller/init";
import mysqlConfig from "./mysql/mysql-config";

dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
app.use("/init", init);
app.use("/users", users);
app.use("/content", content);

app.listen(port, () => {

    mysqlConfig.init();

    console.log(`Server running at http://localhost:${port}`);
});
