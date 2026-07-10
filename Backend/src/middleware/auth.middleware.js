const jwt=require("jsonwebtoken")
const tokenBlacklistModel=require('../models/blacklist.model')  //ye model kya karta hai ki token ko blacklist kr deta hai


async function authUser(req,res,next){
    const token=req.cookies.token
    if(!token){
        return res.status(401).json({
            message: "Unauthorized: No token provided"
        })
    }
    const isBlacklisted= await tokenBlacklistModel.findOne({ token })

    if(isBlacklisted){
        return res.status(401).json({
            message: "Unauthorized: Token is blacklisted"
        })
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        next()
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized: Invalid token"
        })
    }
}

module.exports={ authUser }