import { auth } from "../middlewares/auth.js";
import {
  addTask,
  checkDuplicate,
  deleteTaskById,
  getAllTasks,
  getTaskById,
  updateTaskById,
  filterTaskByCategory,
  filterTaskByUser,
  filterTaskByYear,
  filterTaskByYearAndMonth,
  filterWeekdayTasks,
  filterWeekendTasks,
  createConnection,
} from "../helper.js";
import express from "express";

const router = express.Router();

//Get all tasks
router.get("/", auth, async (req, res) => {
  const client = await createConnection();
  const tasks = await getAllTasks(client);
  res.send(tasks);
});

//Find particular task by ID
router.get("/:id", auth, async (req, res) => {
  const client = await createConnection();
  const taskId = req.params.id;
  const result = await getTaskById(client, taskId);
  res.send(result);
});

//Add task
router.post("/create", auth, async (req, res) => {
  const client = await createConnection();
  const newTask = req.body;
  const duplicates = await checkDuplicate(client, newTask);

  //Check for duplication
  if (duplicates.length === 0) {
    const result = await addTask(client, newTask);
    res.send(result);
  } else {
    res.send("Duplicate of task already exists");
  }
});

//Update particular task using ID
router.patch("/:id", auth, async (req, res) => {
  const client = await createConnection();
  const taskId = req.params.id;
  const updatedData = req.body;
  const updatedTask = await updateTaskById(client, taskId, updatedData);
  res.send(updatedTask);
});

//Delete task using ID
router.delete("/:id", auth, async (req, res) => {
  const client = await createConnection();
  const taskId = req.params.id;
  const deletedTask = await deleteTaskById(client, taskId);
  res.send(deletedTask);
});

//Filter tasks using categories
router.get("/category/:name", auth, async (req, res) => {
  const client = await createConnection();
  const category = req.params.name;
  const filteredTasks = await filterTaskByCategory(client, category);
  res.send(filteredTasks);
});

//Filter tasks by UserName
router.get("/user/:name", auth, async (req, res) => {
  const client = await createConnection();
  const userName = req.params.name;
  const filteredTasks = await filterTaskByUser(client, userName);
  res.send(filteredTasks);
});

//Filter tasks by Year
router.get("/year/:year", auth, async (req, res) => {
  const client = await createConnection();
  const year = req.params.year;
  const tasks = await getAllTasks(client);
  const result = filterTaskByYear(tasks, year);
  result.length !== 0 ? res.send(result) : res.send("No results found");
});

//Filter tasks by Year and month
router.get("/year/:year/:month", auth, async (req, res) => {
  const client = await createConnection();
  const year = req.params.year;
  const month =
    req.params.month.split("").length === 1
      ? `0${req.params.month}`
      : req.params.month;
  const filteredTasks = await getAllTasks(client);
  const result = filterTaskByYearAndMonth(filteredTasks, year, month);
  result.length !== 0 ? res.send(result) : res.send("No results found");
});

//Filter tasks by Weekday tasks (Mon-Fri)
router.get("/weekday/all", auth, async (req, res) => {
  const client = await createConnection();
  const filteredTasks = await getAllTasks(client);
  const result = filterWeekdayTasks(filteredTasks);
  result.length !== 0 ? res.send(result) : res.send("No results found");
});

//Filter tasks by Weekend tasks (Sat, Sun)
router.get("/weekend/all", auth, async (req, res) => {
  const client = await createConnection();
  const filteredTasks = await getAllTasks(client);
  const result = filterWeekendTasks(filteredTasks);
  result.length !== 0 ? res.send(result) : res.send("No results found");
});

export const tasksRouter = router;
