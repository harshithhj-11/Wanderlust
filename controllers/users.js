const User = require("../models/user");


module.exports.signup = async (req, res) => {
  try{
     const { username, password } = req.body;

        const newUser = new User({
            username: username
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
        if (err) {
        return next(err);
        }

        req.flash("success", "Welcome to WanderLust!");
        res.redirect("/listings");
    });
  }
  catch(e){
    req.flash("error", e.message);
    res.redirect("/users/signup");
  }
};

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login");
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to WanderLust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res,next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You have been logged out!");
        res.redirect("/listings");
    });
}