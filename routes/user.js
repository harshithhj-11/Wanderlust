const express = require("express");
const router = express.Router();

const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware");
const userController = require("../controllers/users");

// ---------------- SIGNUP FORM ----------------
router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

// ---------------- LOGIN FORM ----------------
router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl,
     passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: true
    }),userController.login
);

//----------logout----------------

router.get("/logout", userController.logout);
module.exports = router;