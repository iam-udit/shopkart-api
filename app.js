var logger = require('morgan');
var dotenv = require("dotenv");
var express = require('express');
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var createError = require('http-errors');
var swaggerUI = require('swagger-ui-express');
var expAutoSan = require("express-autosanitizer");
var shopKartDocs = require('./api/documents/shopkart-docs.json');

// Importing router modules
var userRoutes = require("./api/routes/users");
var orderRoutes = require("./api/routes/orders");
var sellerRoutes = require("./api/routes/sellers");
var productRoutes = require("./api/routes/products");
var logisticRoutes = require("./api/routes/logistics");

// Adding config file
dotenv.config({path : 'config/process.env'});

// creating application
var app = express();

// Setting up morgan logging packase as dev mode.
app.use(logger('dev'));

// Allow public/upload as static
app.use('/public', express.static('public'));

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
mongoose.connection.on('error',
    console.error.bind(console, 'Database Connectivity Failed !'));

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
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/sellers", sellerRoutes);
app.use("/products", productRoutes);
app.use("/logistics", logisticRoutes);

// Providing routes for api-documents
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(shopKartDocs));

// Redirecting main page to api-docs
app.use("/", (req, res)=>res.redirect('/api-docs'));




// If invalid url, catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, "Invalid Url !"));
});

// error handler, return the error response
app.use( (err, req, res, next) => {
    delete err.stack;
  res.status(err.status || 500);
  err.status = res.statusCode;
  res.json(err);
});

module.exports = app;
