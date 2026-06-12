const mongoose=require("mongoose");

const { v4: uuidv4 } = require("uuid");
const Schema=mongoose.Schema;

const listingschema=new mongoose.Schema({
    title:{
        type:String,
    },
    description:{
        type:String,
    },
    image: {
    type: String,
  },
    price: Number,
    location: String,
    country: String,
     owner: {                                    // ✅ add here
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
})
const Listings=mongoose.model("Listings",listingschema);
module.exports=Listings;