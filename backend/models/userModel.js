const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please Enter Your Name"],
        maxLength:[30,"Name cannot exceed 30 character"],
        minLength:[4,"Name should have more than 4 character"],
    },
    email:{
        type:String,
        required: [true,"Please Enter Your Email"],
        unique: true,
        validator:[validator.email,"Please enter a valid email"]
    },
    password:{
        type:String,
        required: [true,"Please Enter Your Password"],
        minLength:[4,"Password must be at least 4 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,
            required: true,
        },
        url:{
            type:String,
            required: true,
        }
    },
    role:{
        type:String,
        default: "user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
});

userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

//JWT TOKEN
userSchema.methods.getJWTToken = function(){
    return jwt.sign({ id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
};

// Password Match
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

// Reset password

userSchema.methods.getResetPasswordToken = function(){
    
}





module.exports = mongoose.model("User", userSchema);