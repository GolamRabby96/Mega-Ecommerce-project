const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

exports.registerUser = catchAsyncError(async (req, res, next) => {
	const { name, email, password } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		avatar: {
			public_id: "this is sample public id",
			url: "profileapiURL",
		},
	});

	sendToken(user, 201, res);
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
	const { email, password } = req.body;

	// Checking if user has giving email and password both
	if (!email || !password) {
		return next(new ErrorHandler("Please Enter Email And Password", 400));
	}

	const user = await User.findOne({ email }).select("+password");
	if (!user) {
		return next(new ErrorHandler("Invalid Email And Password"), 401);
	}

	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new ErrorHandler("Invalid Email And Password", 401));
	}

	sendToken(user, 200, res);
});

// User Logout

exports.logOut = catchAsyncError(async (req, res, next) => {
	res.cookie("token", null, {
		expires: new Date(Date.now()),
		httpOnly: true,
		message: "Logged Out",
	});

	res.status(200).json({
		success: true,
		message: "Logged out",
	});
});

//Forgot Password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorHandler("User not found", 404));
	}

	// Get password reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	const resetPasswordUrl = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/password/reset/${resetToken}`;

	const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\nif you have not requested this email then please ignore it`;

	try {
		await sendEmail({
			email: user.email,
			subject: `Ecommerce Password Recovery`,
			message,
		});

		res.status(200).json({
			success: true,
			message: `Email sent to ${user.email} successfully`,
		});
	} catch (error) {
		user.resetpasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorHandler(error.message, 404));
	}
});

//After forgot Password ---> Reset Password

exports.resetPassword = catchAsyncError(async (req, res, next) => {
	// Creating token hash...
	const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(
			new ErrorHandler(
				"Reset password token is invalid or has been expired",
				404
			)
		);
	}
	if (req.body.password !== req.body.confirmPassword) {
		return next(new ErrorHandler("Password does not match", 400));
	}

	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();
	sendToken(user, 200, res);
});

// Get User Details

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		user,
	});
});

// Update user password

exports.updatePassword = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

	if (!isPasswordMatched) {
		return next(new ErrorHandler("Old Password does not match", 400));
	}

	if (req.body.newPassword !== req.body.confirmPassword) {
		return next(new ErrorHandler("Password does not match", 400));
	}

	user.password = req.body.newPassword;
	await user.save();

	sendToken(user, 200, res);
});

// Updated user profile

exports.updateProfile = catchAsyncError(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
	};
	// Image will be added cloudinary letter

	const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAdnModify: false,
	});

	res.status(200).json({
		success: true,
	});
});

//For Admin --> Get all users
exports.getAllUser = catchAsyncError(async (req, res, next) => {
	const users = await User.find();
	res.status(200).json({
		success: true,
		users,
	});
});

//For Admins --> get single users for admin

exports.getSingleUser = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new ErrorHandler(`User not found for this id-${req.params.id}`)
		);
	}

	res.status(200).json({
		success: true,
		user,
	});
});

//Update User Role

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
	};
	// Image update will be letter
	const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAdnModify: false,
	});

	if (!user) {
		return next(
			new ErrorHandler(`User does not exit with id:${req.params.id}`)
		);
	}

	res.status(200).json({
		success: true,
	});
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return next(
			new ErrorHandler(`User does not exit with id:${req.params.id}`)
		);
	}

	await user.remove();

	res.status(200).json({ success: true, message: "User deleted successfully" });
});
