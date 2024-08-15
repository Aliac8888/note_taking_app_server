module.exports = {
  databaseURI: "mongodb://127.0.0.1:27017/dev", // MongoDB URL
  appId: "myAppId",
  masterKey: "myMasterKey", // Keep it secret!
  serverURL: "http://localhost:1337/parse", // Mount path
  cloud: __dirname + "/../cloud/main.js",
};
