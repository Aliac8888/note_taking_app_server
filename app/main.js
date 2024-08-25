require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const { ParseServer } = require("parse-server");
const path = require("path");
const parseConfig = require("./config/parseConfig");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

module.exports = {
  express,
  ParseServer,
  path,
  parseConfig,
  authRoutes,
  noteRoutes,
};
