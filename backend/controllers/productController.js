const catchAsyncError = require("../middleware/catchAsyncError");
const Product = require("../models/productModel");
const ApiFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorhandler");

// Only for ADMIN

exports.createProduct = catchAsyncError(async (req, res, next) => {
	req.body.user = req.user.id;

	const product = await Product.create(req.body);

	res.status(201).json({
		success: true,
		product,
	});
});

exports.getAllProducts = catchAsyncError(async (req, res) => {
	const resultPerPage = 5;
	const productCount = await Product.countDocuments();

	const apiFeature = new ApiFeatures(Product.find(), req.query)
		.search()
		.filter()
		.pagination(resultPerPage);

	const products = await apiFeature.query;

	res.status(200).json({
		success: true,
		products,
	});
});

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.id);
	if (!product) {
		return next(new ErrorHandler("Product Not Found", 404));
	}
	res.status(200).json({
		success: true,
		product
	});
});
// Update product ADMIN

exports.updateProduct = catchAsyncError(async (req, res, next) => {
	let product = await Product.findById(req.params.id);

	if (!product) {
		return res.status(500).json({
			success: false,
			message: "Product not found",
		});
	}

	product = await Product.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
		useFindAdnModify: false,
	});

	res.status(200).json({
		success: true,
		product,
	});
});

// Delete product __ADMIN__

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.id);

	if (!product) {
		return res.status(500).json({
			success: false,
			message: "Product Not Found",
		});
	}

	await product.remove();
	res.status(200).json({
		success: true,
		message: "Product Deleted successfully",
	});
});

//Product Rating
exports.productReview = catchAsyncError(async (req, res, next) => {
	const {rating, comment, productId } = req.body;

	const review = {
		user:req.user.id,
		name:req.user.name,
		rating:Number(rating),
		comment
	}

	const product = await Product.findById(productId);
	const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user.id.toString());

	if (isReviewed) {
		product.reviews.forEach(rev=>{
			if(rev.user.toString() === req.user.id.toString()){
				rev.rating = rating;
				rev.comment = comment
			}
		})

	} else {
		product.reviews.push(review);
		product.numOfReviews = product.reviews.length;
	}

	let avg =0;
	product.ratings = product.reviews.forEach(rev=>{
		avg+= rev.rating;
	})

	product.ratings = avg/product.reviews.length;

	await product.save({validateBeforeSave:false});

	res.status(200).json({
		success:true,
		product
	})
});

// get all reviews based on single product

exports.getProductReviews = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.query.id);

	if(!product){
		return next(new ErrorHandler("Product not found",404));
	}

	res.status(200).json({
		success:true,
		reviews:product.reviews
	})
})
//delete reviews
exports.deleteReview = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.query.productId);
	if(!product){
		return next(new ErrorHandler("Product not found",404));
	};

	const reviews = product.reviews.filter(rev=>rev._id.toString() !== req.query.id.toString());

	let avg = 0;
	reviews.forEach(rev=>{
		avg += rev.rating;
	});

	const ratings = avg / reviews.length;

	const numOfReviews = reviews.length;

	await Product.findByIdAndUpdate(req.query.productId,{
		reviews,ratings, numOfReviews
	},{
		new:true,
		runValidators:true,
		useFindAdnModify:false
	})

	res.status(200).json({
		success: true,
	})
})