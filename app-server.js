import express from "express";
import mongoose from "mongoose";
import mongodb from "mongodb"
import sanitizeHTML from "sanitize-html"

const todo = express();
let db;

todo.use(express.static("public"));
const connectionString =
  "mongodb+srv://todoAppuser:password16@cluster0.78bgoyj.mongodb.net/TodoApp?retryWrites=true&w=majority";

(async function () {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the database");
    db = mongoose.connection; // Assign the database object to db variable
    todo.listen(3001);
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();

todo.use(express.json());
todo.use(express.urlencoded({ extended: true }));

function Password(req, res, next) {
  res.set('www-Authenticate', 'Basic realm= "Simple Todo App"')
  console.log(req.headers.authorization)
  if (req.headers.authorization =="Basic ZnVjayB5b3U6aWtl") {
    next()
  } else {
    res.status(401).send("password needed")
  }
}

todo.use(Password)

todo.get("/", function (req, res) {
  async function fetchItems() {
    try {
      const items = await db.collection("items").find().toArray();
      res.send(`<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple To-Do App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
      </head>
      <body>
        <div class="container">
          <h1 class="display-4 text-center py-1">To-Do App</h1>
          
          <div class="jumbotron p-3 shadow-sm">
            <form id= "create-form" action= "/create-item" method="POST">
              <div class="d-flex align-items-center">
                <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                <button class="btn btn-primary">Add New Item</button>
              </div>
            </form>
          </div>
          
          <ul id="item-list" class="list-group pb-5">
           
          </ul>
          
        </div>
        <script>
          let items = ${JSON.stringify(items)}
        </script>
        <script src="https://unpkg.com/axios@1.1.2/dist/axios.min.js"></script>
        <script src="/browser.js"></script>
      </body>
      </html>
      `);
    } catch (err) {
      console.error(err);
    }
  }

  fetchItems();
});

todo.post("/create-item", function (req, res) {
  let safeinput = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection("items").insertOne({ text: safeinput }, function (
    err,
    info
  ) {
    if (err) {
      console.error("Error inserting item:", err);
      return;
    }

    const insertedId = new mongodb.ObjectId(info.insertedId);

    db.collection("items").findOne({ _id: insertedId }, function (
      err,
      document
    ) {
      if (err) {
        console.error("Error retrieving inserted document:", err);
        return;
      }

      res.json(document);
    });
  });
});

todo.post("/edit-item", function (req, res) {
  let safeinput = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection("items").findOneAndUpdate(
    { _id: new mongodb.ObjectId(req.body.id) },
    { $set: { text: safeinput} },
    function () {
      res.send("done");
    }
  );
});

todo.post("/delete-item", function (req, res) {
  db.collection("items").deleteOne(
    { _id: new mongodb.ObjectId(req.body.id) },
    function () {
      res.send("success");
    }
  );
});
