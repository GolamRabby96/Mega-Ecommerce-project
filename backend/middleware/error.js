const Errorhandler = require("../utils/errorhandler");

module.exports = (err,req, res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error"


     //CastError - for mongodb
    if(err.name === "CastError"){
        const message = `Resource not found. invalid:-( ${err.path})`;
        err = new Errorhandler(message,400);
    }



    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}