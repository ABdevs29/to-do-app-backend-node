const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

async function createConnection() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  console.log("Mongo Client connected successfully");
  return client;
}

createConnection();

//API Home
app.get("/", (req, res) => {
  res.send("To-do App Home");
});

//Add task
app.post("/tasks/create", async (req, res) => {
  const client = await createConnection();
  const newTask = req.body;

  const checkDuplicate = await client
    .db("to-do-app")
    .collection("tasks")
    .find({ task_name: newTask.task_name })
    .toArray();

  //Check for duplication
  if (checkDuplicate.length === 0) {
    const result = await client
      .db("to-do-app")
      .collection("tasks")
      .insertOne(newTask);

    console.log(result);
    res.send(result);
  } else {
    res.send("Duplicate of task already exists");
  }
});

//Get all tasks
app.get("/tasks", async (req, res) => {
  const client = await createConnection();
  const tasks = await client
    .db("to-do-app")
    .collection("tasks")
    .find({})
    .toArray();

  console.log(tasks);
  res.send(tasks);
});

//Find particular task by ID
app.get("/tasks/:id", async (req, res) => {
  const client = await createConnection();
  const taskId = req.params.id;

  const result = await client
    .db("to-do-app")
    .collection("tasks")
    .find({ _id: ObjectId(taskId) })
    .toArray();

  console.log(result);
  res.send(result);
});

//Update particular task using ID
app.patch("/tasks/:id", async (req, res) => {
  const client = await createConnection();
  const taskId = req.params.id;
  const updatedData = req.body;

  const updatedTask = await client
    .db("to-do-app")
    .collection("tasks")
    .updateOne(
      { _id: ObjectId(taskId) },
      {
        $set: {
          task_name: updatedData.task_name,
          task_deadline: updatedData.task_deadline,
          task_time: updatedData.task_time,
          user_name: updatedData.user_name,
          category: updatedData.category,
        },
      }
    );
  console.log(updatedTask);
  res.send(updatedTask);
});

//Delete task using ID
app.delete("/tasks/:id", async (req, res) => {
  const client = await createConnection();
  const taskId = req.params.id;

  const deletedTask = await client
    .db("to-do-app")
    .collection("tasks")
    .deleteOne({ _id: ObjectId(taskId) });

  console.log(deletedTask);
  res.send(deletedTask);
});

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
});


//TODO: Filter tasks using categories, users, month, year, weekday, weekends.