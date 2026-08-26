if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const {MongoStore} = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const  LocalStrategy = require("passport-local");
const User = require("./models/user");
// Routers
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");


const dbUrl = process.env.ATLASDB_URL ;



// ---------------- EJS ----------------

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));


// ---------------- Middleware ----------------

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));


// ---------------- MongoDB ----------------

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));


// ---------------- Server ----------------

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});


// ---------------- Home ----------------
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60, // time period in seconds 
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }, 
};

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use(session(sessionConfig));
app.use(flash());                    //we use flash after session,before the routes

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 


app.use((req, res, next) => {
    console.log("USER MIDDLEWARE RUNNING:", req.user);

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;

    next();
});

// ---------------- Routers ----------------

// Listing routes
app.use("/listings", listingRouter);

// Review routes
app.use("/listings/:id/reviews", reviewRouter);

//user routes
app.use("/users", userRouter);

// ---------------- 404 ----------------

app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


// ---------------- Error Handler ----------------

app.use((err, req, res, next) => {

    let { statusCode = 500 } = err;

    res.status(statusCode).render("listings/error.ejs", {
        err,
    });

});