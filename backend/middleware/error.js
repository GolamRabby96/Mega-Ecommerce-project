const ErrorHandler = require("../utils/errorhandler");

module.exports = (err,req, res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error"


     //CastError - for mongodb
    if(err.name === "CastError"){
        const message = `Resource not found. invalid:-( ${err.path})`;
        err = new Errorhandler(message,400);
    }

    // Mongoose duplicated key error
    if(err.code === 11000){
        const message = `Duplicate ${object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message,400);
    }
    // Wrong JWT token
    if(err.name === 'JsonWebTokenError'){
        const message =` Json web token invalid ,Please try again `;
        err = new ErrorHandler(message,400);
    }
    // JWT expire token error
    if(err.name === 'TokenExpiredError'){
        const message = `Json web token is Expired, try again letter`;
        err = new ErrorHandler(message,400);
    }


    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}