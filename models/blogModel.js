const mongoose = require("mongoose");

const blogModel = new mongoose.Schema(
  {
    img: String,
    title: String,
    description: String,
    createBy : String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("blog", blogModel);
