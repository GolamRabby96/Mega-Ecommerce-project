const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require("./config/database")

//Handling Uncaught Exception -> Error handler
process.on("uncaughtException",(err) =>{
    console.log((`Error: ${err.message}`));
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
})

// configuration
dotenv.config({path:"backend/config/config.env"});
require("dotenv").config();


// Connecting to database

connectDatabase();

const server = app.listen(process.env.port, ()=>{
    console.log(`server is working on http://localhost:${process.env.port}`);
})



// Unhandled promise rejection
process.on('unhandledRejection',err=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server');

    server.close(()=>{
        process.exit(1);
    })
})