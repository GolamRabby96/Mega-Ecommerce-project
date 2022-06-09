const express = require('express');
const app = express();
const errorMiddleware = require('./middleware/error');
const cookiesParser = require('cookie-parser');

// app used
app.use(express.json());
app.use(cookiesParser());


//Router routes
const product = require('./routes/productRoute');
const user = require('./routes/userRoute');

app.use("/api/v1",product);
app.use("/api/v1",user)


//Middleware for error
app.use(errorMiddleware);

module.exports = app