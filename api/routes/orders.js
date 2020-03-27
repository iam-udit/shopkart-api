const express = require("express");
const route = express.Router();

route.get("/:orderid", (req, res, next) => {
    res.status(200).json({
        "message": "Order are fetched.",
        "orderid": req.params.orderid
    });
});

// Handle post request.
route.post("/", (req, res, next) => {
    const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    };
    res.status(200).json({
        "message": "Order is created",
        order: order
    });
});


route.delete("/:orderid", (req, res, next) => {
    res.status(200).json({
        "message": "Order is deleted",
        "orderid": req.params.orderid,
    });
});


module.exports = route;