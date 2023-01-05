const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3002);

    console.log("server is created");
  } catch (e) {
    console.log(`error msg is ${e.message}`);
  }
};

initializeDb();

app.get("/todos/", async (request, response) => {
  const { search_q, priority, status } = request.query;
  if (status != undefined && priority != undefined) {
    const getQuery = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority LIKE '%${priority}%'; `;

    const playersArray = await db.all(getQuery);
    response.send(playersArray);
  } else if (priority != undefined) {
    const getQuery = `SELECT * FROM todo where  priority LIKE '%${priority}%' ; `;

    const playersArray = await db.all(getQuery);
    response.send(playersArray);
  } else if (search_q != undefined) {
    const getQuery = `SELECT * FROM todo where todo LIKE '%${search_q}%' ; `;

    const playersArray = await db.all(getQuery);
    response.send(playersArray);
  } else if (status != undefined) {
    const getQuery = `SELECT * FROM todo where  status LIKE '%${status}%' ; `;

    const playersArray = await db.all(getQuery);
    response.send(playersArray);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo where id=${todoId} ; `;

  const playersArray = await db.get(getQuery);
  response.send(playersArray);
});

app.post("/todos/", async (request, response) => {
  const todoItem = request.body;
  const { id, todo, priority, status } = todoItem;

  const putQuery = `INSERT INTO todo (id,todo,priority,status) VALUES ('${id}','${todo}','${priority}','${status}'); `;

  const playersArray = await db.run(putQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

  await db.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const putQuery = `DELETE  FROM todo WHERE id=${todoId}; `;

  const playersArray = await db.run(putQuery);
  response.send("Todo Deleted");
});

module.exports = app;
