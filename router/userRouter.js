const express = require("express");
const route = express();
const path = require("path");
const hbs = require("express-handlebars");
const session = require("express-session");

const cookieParser = require("cookie-parser");

//requiring user schema
const userSchema = require("../model/userModel");
const config = require("../config/config");

//requiring user controller
const userController = require("../controller/userController");
const userAuth = require("../middleware/userAuth");

//session
route.use(cookieParser());

route.use(
  session({
    secret: config.secretKey,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: config.maxAge,
    },
  })
);

//get methods

route.get("/cart", userAuth.isLogout, userController.loadCart);

route.get("/contact", userController.loadContact);

route.get("/", userController.loadHome);

route.get("/product", userController.loadProduct);

route.get("/shop", userController.loadShop);

route.get("/login", userAuth.isLogin, userController.loadLogin);

route.get("/register", userController.loadRegister);

route.get("/logout", userAuth.logout);

route.get("/productDetails", userController.loadProductDetails);

//post methods

route.post("/register", userController.registerUser, userController.loadHome);

route.post("/login", userController.verifyLogin);

module.exports = route;
