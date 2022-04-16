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

//Filter tasks using categories
app.get("/tasks/category/:name", async (req, res) => {
  const client = await createConnection();
  const category = req.params.name;

  const filteredTasks = await client
    .db("to-do-app")
    .collection("tasks")
    .find({ category: category })
    .toArray();

  console.log(filteredTasks);
  res.send(filteredTasks);
});

//Filter tasks by UserName
app.get("/tasks/user/:name", async (req, res) => {
  const client = await createConnection();
  const userName = req.params.name;

  const filteredTasks = await client
    .db("to-do-app")
    .collection("tasks")
    .find({ user_name: userName })
    .toArray();

  console.log(filteredTasks);
  res.send(filteredTasks);
});

//Filter tasks by Year
app.get("/tasks/year/:year", async (req, res) => {
  const client = await createConnection();
  const year = req.params.year;

  const filteredTasks = await client
    .db("to-do-app")
    .collection("tasks")
    .find({})
    .toArray();

  const result = filteredTasks.filter(
    (el) => el.task_deadline.split("-")[2] === year
  );

  console.log(result);
  result.length !== 0 ? res.send(result) : res.send("No results found");
});

//Filter tasks by Year and month
app.get("/tasks/year/:year/:month", async (req, res) => {
  const client = await createConnection();
  const year = req.params.year;
  const month =
    req.params.month.split("").length === 1
      ? `0${req.params.month}`
      : req.params.month;

  const filteredTasks = await client
    .db("to-do-app")
    .collection("tasks")
    .find({})
    .toArray();

  const result = filteredTasks.filter(
    (el) =>
      el.task_deadline.split("-")[2] === year &&
      el.task_deadline.split("-")[1] === month
  );

  console.log(result);
  result.length !== 0 ? res.send(result) : res.send("No results found");
});

//Filter tasks by Weekday tasks (Mon-Fri)
app.get("/tasks/weekday/all", async (req, res) => {
  const client = await createConnection();

  const filteredTasks = await client
    .db("to-do-app")
    .collection("tasks")
    .find({})
    .toArray();

  const result = filteredTasks.filter((el) => {
    const [day, month, year] = el.task_deadline.split("-");
    const century = year.split("")[0] + year.split("")[1];
    const computedYear =
      +month > 2
        ? +(year.split("")[2] + year.split("")[3])
        : +(year.split("")[2] + year.split("")[3]) - 1;
    const weekdayNum =
      (+day +
        Math.floor(2.6 * (+month > 2 ? +month - 2 : +month + 10) - 0.2) -
        2 * +century +
        +computedYear +
        Math.floor(+computedYear / 4) +
        Math.floor(+century / 4)) %
      7;
      console.log(weekdayNum);
    if (weekdayNum !== 6 && weekdayNum !== 0) {
      return el;
    }
  });
  console.log(result);
  result.length !== 0 ? res.send(result) : res.send("No results found");
});

//Filter tasks by Weekend tasks (Sat, Sun)
app.get("/tasks/weekend/all", async (req, res) => {
  const client = await createConnection();

  const filteredTasks = await client
    .db("to-do-app")
    .collection("tasks")
    .find({})
    .toArray();

  const result = filteredTasks.filter((el) => {
    const [day, month, year] = el.task_deadline.split("-");
    const century = year.split("")[0] + year.split("")[1];
    const computedYear =
      +month > 2
        ? +(year.split("")[2] + year.split("")[3])
        : +(year.split("")[2] + year.split("")[3]) - 1;
    const weekdayNum =
      (+day +
        Math.floor(2.6 * (+month > 2 ? +month - 2 : +month + 10) - 0.2) -
        2 * +century +
        +computedYear +
        Math.floor(+computedYear / 4) +
        Math.floor(+century / 4)) %
      7;
      console.log(weekdayNum);
    if (weekdayNum === 6 || weekdayNum === 0) {
      return el;
    }
  });
  console.log(result);
  result.length !== 0 ? res.send(result) : res.send("No results found");
});

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
});

//TODO: Add Users database and authentication using JWT Web Tokens. Allow access to user tasks only if user is registered in database.
