// Load the route files
const authRoutes = require("../app/routes/authRoutes");
const noteRoutes = require("../app/routes/noteRoutes");

// Register the routes
authRoutes(Parse);
noteRoutes(Parse);
