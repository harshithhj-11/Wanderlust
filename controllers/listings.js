const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {

        const listings = await Listing.find({});

        res.render("listings/index.ejs", { listings });
    };

module.exports.renderNewForm = (req, res) => {
    //console.log(req.user);
    res.render("listings/new.ejs");
};


module.exports.showListing = async (req, res) => {
        const { id } = req.params;
        const listing = await Listing
        .findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        });
        if (!listing) {
            req.flash("error", "Listing you are looking for does not exist!");
            return res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing });
    };

module.exports.createListing = async (req, res) => {
            console.log("CREATE LISTING HIT");
           console.log("FILE:", req.file);
            const { listing } = req.body;
    
            const newListing = new Listing(listing);
    
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
            newListing.owner = req.user._id;

            const response = await axios.get(
                "https://nominatim.openstreetmap.org/search",
                {
                    params: {
                        q: `${listing.location}, ${listing.country}`,
                        format: "json",
                        limit: 1
                    },
                    headers: {
                        "User-Agent": "WanderLust-College-Project"
                    }
                }
            );

            const result = response.data[0];

            if (result) {
                newListing.geometry = {
                    type: "Point",
                    coordinates: [
                        Number(result.lon),
                        Number(result.lat)
                    ]
                };
            }

            await newListing.save();
    
            req.flash("success", "Successfully made a new listing!");
            res.redirect("/listings");
        };

module.exports.editListing = async (req, res) => {
    
            const { id } = req.params;
    
            const listing = await Listing.findById(id);
    
            if (!listing) {
            req.flash("error", "Listing you are looking for does not exist!");
            return res.redirect("/listings");
            }

           let originalImageUrl = listing.image.url;

            originalImageUrl = originalImageUrl.replace(
                    "/upload",
                    "/upload/w_300,h_300,c_fill"
            );
                
           res.render("listings/edit.ejs", {
                listing,
                originalImageUrl
            });
        };


module.exports.updateListing = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        { new: true }
    );

    // Update image if a new one was uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    // Re-geocode the updated location
    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: `${listing.location}, ${listing.country}`,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "WanderLust-College-Project"
            }
        }
    );

    const result = response.data[0];

    if (result) {
        listing.geometry = {
            type: "Point",
            coordinates: [
                Number(result.lon),
                Number(result.lat)
            ]
        };
    }

    await listing.save();

    req.flash("success", "Listing updated successfully!");

    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {

        const { id } = req.params;

        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing deleted successfully!");
        res.redirect("/listings");
    };
    


