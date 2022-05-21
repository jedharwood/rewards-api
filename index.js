import express from "express";
import bodyParser from "body-parser";
import usersRoutes from "./routes/users.js";

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.send("There's nothing to see here");
});

export const server = app.listen(PORT, () =>
  console.log(`Express server is running on port: http://localhost:${PORT}`)
);
