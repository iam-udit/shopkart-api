var fs = require('fs');
var yaml = require('js-yaml');
var logger = require('morgan');
var dotenv = require("dotenv");
var express = require('express');
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var createError = require('http-errors');
var swaggerUI = require('swagger-ui-express');
var expAutoSan = require("express-autosanitizer");
var shopKartDocs = yaml.safeLoad(
    fs.readFileSync('./api/documents/shopkart-docs.yaml', 'utf8')
);

// Importing router modules
var userRoutes = require("./api/routes/users");
var adminRoutes = require("./api/routes/admin");
var orderRoutes = require("./api/routes/orders");
var sellerRoutes = require("./api/routes/sellers");
var courierRoutes = require("./api/routes/couriers");
var productRoutes = require("./api/routes/products");
var logisticRoutes = require("./api/routes/logistics");

// Adding config file
dotenv.config({path : 'config/process.env'});

// creating application
var app = express();

// Setting up morgan logging packase as dev mode.
app.use(logger('dev'));

// Allow public/upload as static
app.use('/', express.static('public/uploads/'));

// Setting up body-parser package
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Sanitizing all incomming request
app.use(expAutoSan.allUnsafe);

// Connecting with mongo db.
try {
    mongoose.connect(
        process.env.DB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        }, (success) => {
            console.log('Database Connected Successfully  !');
        }
    );
} catch (error) {
    console.log("Initial Database Connectivity Failed !");
    console.log('Error: ' + error.message);
}

mongoose.Promise = global.Promise;

// Setting up error event
mongoose.connection.on("error", (error) => {
    console.log('Database Connectivity Failed !');
    console.log('Error: ' + error.message);
});


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
app.use("/admin", adminRoutes);
app.use("/orders", orderRoutes);
app.use("/sellers", sellerRoutes);
app.use("/couriers", courierRoutes);
app.use("/products", productRoutes);
app.use("/logistics", logisticRoutes);

// Providing routes for api-documents
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(shopKartDocs, {
    customSiteTitle: "ShopKart-API",
    customfavIcon: "https://pbs.twimg.com/profile_images/1223070381281382400/AYuXgO5r_400x400.jpg"
}));

// Redirecting main page to api-docs
app.use((req, res, next) => {

    if (req.originalUrl === "/"){
        // If the route is '/', then redirect to api-docs
        res.redirect('/api-docs');
    } else {
    // If invalid url, catch 404 and forward to error handler
        next(createError(404, "Invalid Url !"));
    }
});

// error handler, return the error response
app.use( (err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        status: res.statusCode,
        message: err.message
    });
});


module.exports = app;
