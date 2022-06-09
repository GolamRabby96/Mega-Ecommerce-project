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
	const productCount = await Product.countDocuments()

	const apiFeature = new ApiFeatures(Product.find(), req.query)
		.search()
		.filter()
		.pagination(resultPerPage)

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
		product,
		productCount
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
