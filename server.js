require("dotenv/config");

const mongoose = require("mongoose");

const app = require("./app");

const port = process.env.port;

mongoose
  .connect(process.env.MONGODB_URL_Local)
  .then(() => {
    console.log("Connected to MongoDB database");
    app.listen(port, () => {
      console.log(`application is running on port ${port}`);
    });
  })
  .catch((err) => console.log("Connection to database failed"));
