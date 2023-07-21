const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

app.use(express.json());

const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;
const intilizeserverandDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Started Successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

intilizeserverandDB();

// Api 1

app.get("/todos/", async (request, response) => {
  const { search_q = "", status = "", priority = "" } = request.query;
  const dataQuery = `
    SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND todo LIKE '%${search_q}%';`;
  const dataArray = await db.all(dataQuery);
  response.send(dataArray);
});

// Api 2

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const dataQuery = `SELECT * FROM todo WHERE id = '${todoId}';`;
  const dataArray = await db.get(dataQuery);
  response.send(dataArray);
});

// Api 3

app.post("/todos/", async (request, response) => {
  const datadetails = request.body;
  const { id, todo, priority, status } = datadetails;
  const dataQuery = `
    INSERT INTO todo(id,todo,priority,status) VALUES (
        '${id}',
        '${todo}',
        '${priority}',
        '${status}');`;
  const dataArray = await db.run(dataQuery);
  response.send("Todo Successfully Added");
});

// Api 4

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const datadetails = request.body;
  const dataQuery1 = `
  SELECT * FROM todo WHERE id = ${todoId};`;
  const dataArray1 = await db.get(dataQuery1);
  const {
    todo = dataArray1.todo,
    priority = dataArray1.priority,
    status = dataArray1.status,
  } = datadetails;
  const dataQuery = `
    UPDATE todo SET
    todo = '${todo}',
    priority = '${priority}',
    status = '${status}'
    WHERE id = '${todoId}';`;

  await db.run(dataQuery);
  let value = "";
  switch (true) {
    case todo !== dataArray1.todo:
      value = "Todo";
      break;
    case priority !== dataArray1.priority:
      value = "Priority";
      break;
    case status !== dataArray1.status:
      value = "Status";
      break;
  }

  response.send(`${value} Updated`);
});

// Api 5

app.delete("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const dataQuery = `DELETE FROM todo WHERE id='${todoId}';`;
  await db.run(dataQuery);
  response.send("Todo Deleted");
});

module.exports = app;
