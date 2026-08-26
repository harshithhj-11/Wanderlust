const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {

        const { id } = req.params;

        // Create Review
        const review = new Review(req.body.review);
        review.author = req.user._id;
        // Find Listing
        const listing = await Listing.findById(id);

        // Add Review ID to Listing
        listing.reviews.push(review._id);
        // Save Listing
        await listing.save();
          // Save Review
        await review.save();

        // Redirect
        res.redirect(`/listings/${id}`);

    };


module.exports.destroyReview = async (req, res) => {

        const { id, reviewId } = req.params;

        // Delete Review
        await Review.findByIdAndDelete(reviewId);

        // Remove Review ID from Listing
        await Listing.findByIdAndUpdate(id, {
            $pull: {
                reviews: reviewId
            }
        });

        // Redirect
        res.redirect(`/listings/${id}`);
    };