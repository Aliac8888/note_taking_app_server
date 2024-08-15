const express = require("express");
const { ParseServer } = require("parse-server");
const parseConfig = require("./config/parse-config");
const path = require("path");

const app = express();

// Serve static assets from the /public folder
app.use("/public", express.static(path.join(__dirname, "/public")));

const api = new ParseServer(parseConfig);

api
  .start()
  .then((result) => {
    app.use("/parse", api.app);

    app.listen(1337, function () {
      console.log("Parse Server running on port 1337.");
    });
  })
  .catch((err) => {
    console.log(err);
  });
