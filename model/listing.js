const mongoose=require("mongoose");
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/test");
}
const { v4: uuidv4 } = require("uuid");
const Schema=mongoose.Schema;
main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));
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