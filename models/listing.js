const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
    {

        title: {
            type: String,
            required: true
    },
    description: {
        type: String,
        required: true
    },
   image: {
    filename: {
        type: String,
        default: "adiyogi"
    },

    url: {
        type: String,

        default: "/images/adiyogi.jpg",

        set: (v) =>
            v === ""
                ? "/images/adiyogi.jpg"
                : v
    }
},

     price: {
         type: Number,
       
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
     
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: {
            type: [Number],
        },
    },

    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'    
        }
    ],
    owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
}
}
);

listingSchema.post("findOneAndDelete", async function (listing) {
    if (listing) {
        await mongoose.model("Review").deleteMany({
            _id: { $in: listing.reviews }
        });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;