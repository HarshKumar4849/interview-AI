const express = require('express')
const cookieParser=require("cookie-parser")
const cors=require("cors")
const app = express()

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",") 
  : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
 // ye ik middle ware hai jo ki cors ko handle karta hai
app.use(express.json()) // ye ik middle ware hai 
app.use(cookieParser()) // ye ik middle ware hai jo ki cookie ko read karne me help karta hai

/* require all the routes here */
const authRouter=require("./routes/auth.routes")
const interviewRouter=require("./routes/interview.routes")
/* using all the routes here */
app.use('/api/auth',authRouter)  // auth related jitna bhi api hai agar usko access karna hai to /api/auth likhna hoga
app.use('/api/interview',interviewRouter)  // interview related jitna bhi api hai agar usko access karna hai to /api/interview likhna hoga


module.exports=app