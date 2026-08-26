const express = require("express");
const router = express.Router();

const Listing = require("../models/listing");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");

const { listingSchema } = require("../schema");
const isLoggedIn  = require("../middleware").isLoggedIn;
const { isOwner } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require("multer");
const { storage } = require("../utils/cloudConfig");

const upload = multer({ storage });

// ---------------- Joi Validation ----------------

const validateListing = (req, res, next) => {

    const { error } = listingSchema.validate(req.body, {
        abortEarly: false,
    });

    if (error) {

        const errMsg = error.details
            .map((el) => el.message)
            .join(", ");

        throw new ExpressError(400, errMsg);
    }

    next();
};

// ---------------- NEW ----------------

router.get("/new", isLoggedIn, listingController.renderNewForm);


//---------------- ROUTES ----------------
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, validateListing, upload.single('listing[image][url]'), wrapAsync(listingController.createListing));


router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn, upload.single("listing[image][url]"),validateListing, isOwner, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

// ---------------- EDIT ----------------

router.get(
    "/:id/edit",isLoggedIn,
    isOwner,
    wrapAsync(listingController.editListing)
);

module.exports = router;