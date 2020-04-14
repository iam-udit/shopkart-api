var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var bodyParser = require("body-parser");
var expAutoSan = require("express-autosanitizer");
var mongoose = require("mongoose");
var dotenv = require("dotenv");

// Importing router modules
var productRoutes = require("./api/routes/products");
var orderRoutes = require("./api/routes/orders");
var userRoutes = require("./api/routes/users");
var sellerRoutes = require("./api/routes/sellers");
var logisticRoutes = require("./api/routes/logistics");

// Adding config file
dotenv.config({path : 'config/process.env'});

// creating application
var app = express();

// Setting up morgan logging packase as dev mode.
app.use(logger('dev'));

// Setting up body-parser package
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Sanitizing all incomming request
app.use(expAutoSan.allUnsafe);

// Connecting with mongo db.
mongoose.connect(
    process.env.DB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true
    }
)
mongoose.Promise = global.Promise;

// Hanlding CORS
app.use((req, res, next) => {

  res.header("Access-Control-Allow-Orign", "*");
  res.header(
      "Access-Control-Allow-Headers",
      "Oring, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, DELETE, GET");
    return res.status(200).json({});
  }

  next();

});

// Providing routes
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);
app.use("/sellers", sellerRoutes);
app.use("/logistics", logisticRoutes);



// If invalid url, catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, "Invalid Url !"));
});

// error handler, return the error response
app.use( (err, req, res, next) => {
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
