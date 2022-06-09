const mongoose = require('mongoose');

const connectDatabase =()=>{
    mongoose.connect(process.env.database,{useNewUrlParser:true, useUnifiedTopology:true}).then((data)=>{
        console.log(`Mongodb connected with server: ${data.connection.host}`)
    })
    
    // Due to Unhandle promise rejection function done . this catch function not need any more
    // .catch((err)=>{
    //     console.log(err);
    // })
}


module.exports = connectDatabase