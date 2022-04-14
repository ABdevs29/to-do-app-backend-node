const express = require("express");
const { MongoClient } = require("mongodb");
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

//Add multiple tasks
app.post("/tasks/create", async (req, res) => {
  const client = await createConnection();
  const newTask = req.body;

  const result = await client
    .db("to-do-app")
    .collection("tasks")
    .insertMany([newTask]);

  console.log(result);
  res.send(result);
});

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
});