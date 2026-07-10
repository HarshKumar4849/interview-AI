    require("dotenv").config() // ye line k wajah se humlog .env k andar jo bhi variable create kre ge usko access kr payenge server.js file k andar
    const app=require("./src/app")
    const connectToDB=require("./src/config/database")
   
    connectToDB()
    const PORT = process.env.PORT || 3000;
    app.listen(PORT,()=>{
        console.log(`server is running on port ${PORT}`);
    })