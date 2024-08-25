const path = require("path");

module.exports = {
  databaseURI:
    process.env.PARSE_SERVER_DATABASE_URI || "mongodb://127.0.0.1:27017/dev",
  appId: process.env.PARSE_SERVER_APPLICATION_ID || "myAppId",
  masterKey: process.env.PARSE_SERVER_MASTER_KEY || "myMasterKey", // Keep it secret!
  serverURL: process.env.PARSE_SERVER_URL || "http://localhost:1337/parse", // Default to local URL if env variable is not set
  masterKeyIps: ["0.0.0.0/0", "::1", "::ffff:172.21.0.1"], // insecure for production
};
