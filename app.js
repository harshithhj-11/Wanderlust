// ---------------- Environment ----------------

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


// ---------------- Imports ----------------

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const dns = require("dns");
const path = require("path");

const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user");

// Routers
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");


// ---------------- Configuration ----------------

const PORT = process.env.PORT || 8080;
const dbUrl = process.env.ATLASDB_URL;


// DNS configuration
dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);


// ---------------- EJS ----------------

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));


// ---------------- Basic Middleware ----------------

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));


// ---------------- Home ----------------

app.get("/", (req, res) => {
    res.send("Hello World!");
});


// ---------------- Start Application ----------------

async function startServer() {

    try {

        // Check database URL
        if (!dbUrl) {
            throw new Error(
                "ATLASDB_URL is missing from your environment variables."
            );
        }


        // ---------------- MongoDB ----------------

        await mongoose.connect(dbUrl);

        console.log("Connected to MongoDB");


        // ---------------- Session Store ----------------

        const store = MongoStore.create({
            client: mongoose.connection.getClient(),

            crypto: {
                secret: process.env.SECRET,
            },

            touchAfter: 24 * 60 * 60,
        });

        store.on("error", (err) => {
            console.error("SESSION STORE ERROR:", err.message);
        });


        // ---------------- Session Configuration ----------------

        const sessionConfig = {
            store: store,

            secret: process.env.SECRET,

            resave: false,

            saveUninitialized: true,

            cookie: {
                httpOnly: true,

                expires: Date.now() + 1000 * 60 * 60 * 24 * 7,

                maxAge: 1000 * 60 * 60 * 24 * 7,
            },
        };

        app.use(session(sessionConfig));


        // ---------------- Flash ----------------

        app.use(flash());


        // ---------------- Passport ----------------

        app.use(passport.initialize());

        app.use(passport.session());

        passport.use(
            new LocalStrategy(User.authenticate())
        );

        passport.serializeUser(User.serializeUser());

        passport.deserializeUser(User.deserializeUser());


        // ---------------- Response Locals ----------------

        app.use((req, res, next) => {

            res.locals.success = req.flash("success");

            res.locals.error = req.flash("error");

            res.locals.currentUser = req.user;

            next();

        });


        // ---------------- Routers ----------------

        app.use("/listings", listingRouter);

        app.use("/listings/:id/reviews", reviewRouter);

        app.use("/users", userRouter);


        // ---------------- 404 ----------------

        app.all("/{*splat}", (req, res, next) => {

            next(
                new ExpressError(404, "Page Not Found")
            );

        });


        // ---------------- Error Handler ----------------

        app.use((err, req, res, next) => {

            const { statusCode = 500 } = err;

            res.status(statusCode).render("listings/error.ejs", {
                err,
            });

        });


        // ---------------- Start Server ----------------

        app.listen(PORT, "0.0.0.0", () => {

            console.log(`Server is running on port ${PORT}`);

        });


    } catch (err) {

        console.error(
            "APPLICATION STARTUP FAILED:",
            err.message
        );

        process.exitCode = 1;

    }

}


// ---------------- Run Application ----------------

startServer();