import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { usersRouter } from "./routes/users.js";
import { tasksRouter } from "./routes/tasks.js";
import { createConnection } from "./helper.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

createConnection();

//API Home
app.get("/", (req, res) => {
  res.send("To-do App Home");
});

app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
});
