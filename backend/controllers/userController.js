const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");

exports.registerUser = catchAsyncError(async(req, res, next) => {
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email, password, avatar:{
            public_id:"this is sample public id",
            url:"profileapiURL",
        },
    });

    sendToken(user,201,res);
});


exports.loginUser = catchAsyncError( async(req,res,next)=>{

    const {email, password} = req.body;

    // Checking if user has giving email and password both
    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email And Password",400));
    }

    const user =await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Email And Password"),401);
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid Email And Password",401));
    }

    sendToken(user,200,res);

})


// User Logout

exports.logOut = catchAsyncError( async(req,res,next)=>{
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly:true,
        message:"Logged Out"
    })

    res.status(200).json({
        success:true,
        message:"Logged out"
    })
})
