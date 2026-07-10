const mongoose=require("mongoose")  // mongoose package server k andar database ko connect karta hai




// this function is used to connect to the database
async function connectToDB() {
    try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to database');
    }
    catch(err){
        console.log(err);
        
    }
}


module.exports=connectToDB