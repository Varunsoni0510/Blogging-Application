const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userModel = new mongoose.Schema({
  passwordResetToken: {
    type: Number,
    default: 0,
  },
  firstname: {
    type: String,
    required: [true, "First Name field must not empty"],
  },
  lastname: {
    type: String,
    required: [true, "Last Name field must not empty"],
  },
  username: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "Username field must not empty"],
    minLength: [4, "Username field must have atleast 4 characters"],
  },
  number: {
    type: Number,
    trim: true,
    unique: true,
    required: [true, "Mobile Number is required"],
    minLength: [10, "Mobile Number field must have atleast 10 Number"],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, "Email address is required"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Invalid email address",
    ],
  },
  password: String,

  profileImage: {
    type: String,
    default: "default.jpg",
  },
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "blog" }],

});

userModel.plugin(plm);

const user = mongoose.model("user", userModel);

module.exports = user;
