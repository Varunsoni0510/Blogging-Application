const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/blog")
  .then(() => {
    console.log("database connected on port 3000");
  })
  .catch((err) => {
    console.log(err);
  });


