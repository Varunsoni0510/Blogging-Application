var express = require("express");
var router = express.Router();
const UserModel = require("../models/userModel");
const BlogModel = require("../models/blogModel");
const fs = require("fs");

const upload = require("../utils/multer");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const { sendmail } = require("../utils/mail");

passport.use(new LocalStrategy(UserModel.authenticate()));

//index page
router.get("/", function (req, res, next) {
  res.render("index", { title: "start", user: req.user });
});

//signup page

router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "signup", user: req.user });
});

router.post("/signup", async function (req, res, next) {
  try {
    const { firstname, lastname, username, number, email, password } = req.body;
    const user = await UserModel.register(
      { firstname, lastname, username, number, email },
      password
    );
    res.redirect("/signin");
  } catch (error) {
    res.send(error.message);
  }
});

//signin page

router.get("/signin", function (req, res, next) {
  res.render("signin", { title: "signin", user: req.user });
});

router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/signup",
    successRedirect: "/homepage",
  }),
  function (req, res, next) {}
);

//forget password page

router.get("/forgetPassword", function (req, res, next) {
  res.render("forgetPassword", { title: "forgetPassword", user: req.user });
});

router.post("/forgetPassword", async function (req, res, next) {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (user === null) {
      return res.send(
        `Email Not Found <a href="/forgetPassword">Forget Password</a> `
      );
    }
    sendmail(req, res, user);
  } catch (error) {
    res.send(error);
  }
});

//change password page

router.get("/changePassword/:id", function (req, res, next) {
  res.render("changePassword", {
    title: "changePassword",
    id: req.params.id,
    user: null,
  });
});

router.post("/changePassword/:id", async function (req, res, next) {
  try {
    const user = await UserModel.findById(req.params.id);
    if (user.passwordResetToken === 1) {
      await user.setPassword(req.body.password);
      user.passwordResetToken = 0;
    } else {
      res.send(
        `link expired try again <a href="/get-email">Forget Password</a>`
      );
    }
    await user.save();

    res.redirect("/signin");
  } catch (error) {
    res.send(error.message);
  }
});

//update profile page

router.get("/updateProfile/:id", async function (req, res, next) {
  try {
    const User = await UserModel.findById(req.params.id);
    res.render("updateProfile", {
      title: "Update Profile",
      User,
      user: req.user,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/updateProfile/:id", async function (req, res, next) {
  try {
    await UserModel.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/profile");
  } catch (error) {
    res.send(error);
  }
});

// profile image

router.post(
  "/profileImage",
  upload.single("profileImage"),
  isLoggedIn,
  async function (req, res, next) {
    try {
      if (req.user.profileImage !== "default.jpg") {
        fs.unlinkSync("./public/images/" + req.user.profileImage);
      }
      req.user.profileImage = req.file.filename;
      req.user.save();
      res.redirect("/profile");
    } catch (error) {
      res.send(error);
    }
  }
);
//homepage page

router.get("/homepage", isLoggedIn, async function (req, res, next) {
  try {
    const users = await UserModel.find();
    const globalPost = await BlogModel.find();
    res.render("homepage", {
      title: "homepage",
      globalPost,
      users,
      user: req.user,
    });
  } catch (error) {
    res.send(error);
  }
});

//profile page

router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
    const { blogs } = await req.user.populate("blogs");
    console.log(blogs);
    res.render("profile", { title: "profile", blogs, user: req.user });
  } catch (error) {
    res.send(error);
  }
});
//create Blogs page

router.get("/createBlog", isLoggedIn, async function (req, res, next) {
  res.render("createBlog", { title: "createBlog", user: req.user });
});

router.post("/createBlog", isLoggedIn, async function (req, res, next) {
  try {
    const blog = new BlogModel(req.body);
    blog.user = req.user._id;
    req.user.blogs.push(blog._id);
    await blog.save();
    await req.user.save();
    res.redirect("/profile");
  } catch (error) {
    res.send(error.message);
  }
});

// update blog

router.get("/updateblog/:id", isLoggedIn, async function (req, res, next) {
  try {
    const blog = await BlogModel.findById(req.params.id);
    res.render("updateblog", {
      title: "Update Blog",
      user: req.user,
      blog,
    });
  } catch (error) {
    res.send(error);
  }
});

router.post("/updateblog/:id", isLoggedIn, async function (req, res, next) {
  try {
    await BlogModel.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/profile");
  } catch (error) {
    res.send(error);
  }
});

// delete blog

router.get("/deleteblog/:id", isLoggedIn, async function (req, res, next) {
  try {
    await BlogModel.findByIdAndDelete(req.params.id);
    res.redirect("/profile");
  } catch (error) {
    res.send(error);
  }
});

//reset password page

router.get("/reset/:id", isLoggedIn, async function (req, res, next) {
  res.render("reset", {
    title: "Reset Password",
    id: req.params.id,
    user: req.user,
  });
});

router.post("/reset/:id", isLoggedIn, async function (req, res, next) {
  try {
    await req.user.changePassword(req.body.oldpassword, req.body.password);
    await req.user.save();
    res.redirect("/profile");
  } catch (error) {
    res.send(error);
  }
});

//sign Out

router.get("/signout", async function (req, res, next) {
  req.logout(() => {
    res.redirect("/signin");
  });
});

// isLoggedIn function
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/signin");
}

module.exports = router;
