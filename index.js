require("dotenv").config();
const express=require("express");
const mongoose=require("mongoose");
const { v4: uuidv4 } = require("uuid"); 
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./model/user.js");
const cookieParser=require("cookie-parser");
const session=require("express-session");
const MongoStore=require("connect-mongo")
const flash=require("connect-flash");
const path=require("path");
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const crypto = require("crypto");
const Razorpay = require("razorpay");

// User submits login form
//         ↓
// Passport checks username/password against MongoDB
//         ↓
// If correct → Passport calls req.login()
//         ↓
// Passport serializes the user (saves user ID into session)
//         ↓
// Session is stored server-side (MongoDB/memory)
//         ↓
// Cookie with session ID sent to browser
//         ↓
// On next request → browser sends cookie back
//         ↓
// Passport deserializes (fetches user from DB using session ID)
//         ↓
// req.user is now available everywhere




// res.cookie("key","value")
const razorpay = new Razorpay({
  key_id: process.env.Test_API_Key,
  key_secret: process.env.Test_Key_Secret,
});




const app=express();
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");



app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
const methodOverride = require("method-override");
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        return req.body._method;
    }
    return req.query._method; // also check query string
}));

const store=MongoStore.create({
    mongoUrl=process.env.MONGO_URL,
    crypto:{
        secret:"heheh",
    },
    touchAfter:24*3600,
})
app.use(session({
    store,
    secret:"heheh",
    resave:true,
    saveUninitialized:true,
    cookie:{
        expires:new Date(Date.now()+7*24*60*60*1000),
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}));


app.use(flash());


app.use(passport.initialize());
app.use(passport.session());  //browse from page to page
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
     console.log("success:", res.locals.success);
    next();
});
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


async function main() {
  await mongoose.connect(process.env.MONGO_URL);
}

main()
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));
const Listings=require("./model/listing.js");




app.get("/listings",async (req,res)=>{
    let listings=await Listings.find();
    res.render("listings.ejs",{listings});
});
app.get("/",(req,res)=>{
    res.render("home.ejs");
});
app.get("/signup",(req,res)=>{
    res.render("sign.ejs");
})
app.get("/login",(req,res)=>{
    res.render("login.ejs");
})
app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}), (req, res) => {
    req.flash("success", "Welcome back! You're now logged in.");
    res.redirect("/host");
});

// Add this back, with the fix applied
app.post("/", async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if(err) return next(err);
            req.flash("success", "Account created successfully! Welcome to WanderStay.");
            res.redirect("/host");
        });
    } catch (err) {
        req.flash("error", err.message);  // passport-local-mongoose gives exact messages
        res.redirect("/signup");
    }
});

app.get("/listings/:id",async (req,res)=>{
  if(!req.isAuthenticated()){
    req.flash("error", "You need to signup to view the property");  // passport-local-mongoose gives exact messages
      return res.redirect("/signup");
  }
    let {id}=req.params;
    let buylist=await Listings.findById(id);
    res.render("eachlist.ejs",{buylist, razorpayKey: process.env.Test_API_Key });
})


app.get("/newlisting",async (req,res)=>{
    res.render("newlisting.ejs");}
)
app.get("/newlisting/:id/edit",async (req,res)=>{
    let {id}=req.params;
    let listing=await Listings.findById(id);
    res.render("edit.ejs",{listing});
})
app.delete("/newlisting/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to login first");
        return res.redirect("/login");
    }
    await Listings.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted!");
    res.redirect("/host");
});
app.post("/savenewlisting", upload.single('image'),async (req,res)=>{
    let {title,description,price,country,location}=req.body;
    let image = req.file ? `/uploads/${req.file.filename}` : "";

   const newlist=new Listings({
    title,
    description,
    image,
    price,
    country,
    location,
     owner: req.user._id
   })
   await newlist.save();
  //  let listings = await Listings.find({ owner: req.user._id });
  req.flash("success", "Listing created!");
   req.session.save((err) => {        // ← force session save before redirect
        if (err) console.log(err);
    res.redirect("/host"); 
})})

app.get("/host", async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You need to signup to host a property");
        return res.redirect("/signup");
    }
    try {
        let listings = await Listings.find({ owner: req.user._id });
        res.render("host.ejs", { listings });
    } catch (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/signup");
    }
});
app.post("/host/:id",async (req,res)=>{
    let {id}=req.params;
    let updatelist=Listings.findByIdAndUpdate(id);
     let listings = await Listings.find({ owner: req.user._id });
    res.render("host.ejs", { listings });
})


// {buylist,checkin,checkout}

app.post("/api/create-order", async (req, res) => {
  const { listingId, checkIn, checkOut, totalAmount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // ₹ to paise
      currency: "INR",
      receipt: `bk_${Date.now()}`,
      notes: { listingId, checkIn, checkOut },
    });

    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// 2. Verify Payment
app.post("/api/verify-payment", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails } = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.Test_Key_Secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }

  // ✅ Save booking to DB here
  console.log("Booking confirmed:", bookingDetails);
  res.json({ success: true, paymentId: razorpay_payment_id });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
