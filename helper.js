import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

async function createConnection() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  console.log("Mongo Client connected successfully");
  return client;
}

async function findUser(client, userName) {
  return await client.db("to-do-app").collection("users").findOne({ userName });
}

async function getAllUsers(client) {
  return await client.db("to-do-app").collection("users").find({}).toArray();
}

async function addNewUser(client, userName, hashedPassword) {
  return await client
    .db("to-do-app")
    .collection("users")
    .insertOne({ userName, password: hashedPassword });
}

function filterWeekendTasks(filteredTasks) {
  return filteredTasks.filter((el) => {
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
}

function filterWeekdayTasks(filteredTasks) {
  return filteredTasks.filter((el) => {
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
}

async function comparePasswords(result, password) {
  const storedDbPassword = result.password;
  return await bcrypt.compare(password, storedDbPassword);
}

async function genPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

function filterTaskByYearAndMonth(filteredTasks, year, month) {
  return filteredTasks.filter(
    (el) =>
      el.task_deadline.split("-")[2] === year &&
      el.task_deadline.split("-")[1] === month
  );
}

function filterTaskByYear(tasks, year) {
  return tasks.filter((el) => el.task_deadline.split("-")[2] === year);
}

async function filterTaskByUser(client, userName) {
  return await client
    .db("to-do-app")
    .collection("tasks")
    .find({ user_name: userName })
    .toArray();
}

async function filterTaskByCategory(client, category) {
  return await client
    .db("to-do-app")
    .collection("tasks")
    .find({ category: category })
    .toArray();
}

async function deleteTaskById(client, taskId) {
  return await client
    .db("to-do-app")
    .collection("tasks")
    .deleteOne({ _id: ObjectId(taskId) });
}

async function updateTaskById(client, taskId, updatedData) {
  return await client
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
}

async function getTaskById(client, taskId) {
  return await client
    .db("to-do-app")
    .collection("tasks")
    .find({ _id: ObjectId(taskId) })
    .toArray();
}

async function getAllTasks(client) {
  return await client.db("to-do-app").collection("tasks").find({}).toArray();
}

async function addTask(client, newTask) {
  return await client.db("to-do-app").collection("tasks").insertOne(newTask);
}

async function checkDuplicate(client, newTask) {
  return await client
    .db("to-do-app")
    .collection("tasks")
    .find({ task_name: newTask.task_name })
    .toArray();
}

export {
  createConnection,
  addNewUser,
  addTask,
  checkDuplicate,
  comparePasswords,
  deleteTaskById,
  filterTaskByCategory,
  filterTaskByUser,
  filterTaskByYear,
  filterTaskByYearAndMonth,
  filterWeekdayTasks,
  filterWeekendTasks,
  findUser,
  genPassword,
  getAllTasks,
  getAllUsers,
  getTaskById,
  updateTaskById,
};
