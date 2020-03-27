var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// Importing router modules
var productRoutes = require("./api/routes/products");
var orderRoutes = require("./api/routes/orders");
var userRoutes = require("./api/routes/users");

var app = express();

// Setting up morgan logging packase as dev mode.
app.use(logger('dev'));

// Setting up body-parser package
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Connecting with mongo db.
mongoose.connect(
    "mongodb+srv://uditn:" + process.env.MONGO_ATLAS_PW +
    "@node-rest-api-vq0e4.mongodb.net/shopkart? retryWrites = true & w = majority ", {
      useUnifiedTopology: true,
      useNewUrlParser: true
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

// If invalid url, catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, "Invalid Url !"));
});

// error handler
app.use(function(err, req, res, next) {
  // return the error response
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
