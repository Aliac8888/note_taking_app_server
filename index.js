const {
  express,
  ParseServer,
  path,
  parseConfig,
  authRoutes,
  noteRoutes,
} = require("./app/main");

const app = express();

// Serve static assets from the /public folder
app.use("/public", express.static(path.join(__dirname, "/public")));

const api = new ParseServer(parseConfig);

api
  .start()
  .then((result) => {
    authRoutes(Parse);
    noteRoutes(Parse);
    app.use("/parse", api.app);

    app.listen(1337, function () {
      console.log("Parse Server running on port 1337.");
    });
  })
  .catch((err) => {
    console.log(err);
  });
