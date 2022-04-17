import jwt from "jsonwebtoken";
import { auth } from "../middlewares/auth.js";
import {
  addNewUser,
  comparePasswords,
  createConnection,
  findUser,
  genPassword,
  getAllUsers,
} from "../helper.js";
import express from "express";

const router = express.Router();

// Add user
router.post("/signup", async (req, res) => {
  const client = await createConnection();
  const { userName, password } = req.body;
  const hashedPassword = await genPassword(password);
  const user = await addNewUser(client, userName, hashedPassword);
  res.send(user);
});

// Get all Users
router.get("/", auth, async (req, res) => {
  const client = await createConnection();
  const usersList = await getAllUsers(client);
  res.send(usersList);
});

// User Login
router.post("/login", async (req, res) => {
  const client = await createConnection();
  const { userName, password } = req.body;
  const result = await findUser(client, userName);
  const doesPasswordMatch = await comparePasswords(result, password);
  if (doesPasswordMatch) {
    const token = jwt.sign({ id: result._id }, process.env.SECRET_KEY);
    res.send({ message: "Login successfull!", token });
  } else {
    res.send({ message: "Invalid login credentials" });
  }
});

export const usersRouter = router;
