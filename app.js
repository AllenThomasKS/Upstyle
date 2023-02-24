const express = require("express");
const app = express();
const hbs = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const nocache = require("nocache");
const cors = require('cors');


const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

app.use(cors())

//routes setting
const userRouter = require("./router/userRouter");
const adminRouter = require("./router/adminRouter");

// parsing incoming data's
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//
app.use("/", userRouter);
app.use("/admin", adminRouter);

//setting view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

//setting up admin router
adminRouter.set("views", path.join(__dirname, "views/admin"));
adminRouter.set("view engine", "hbs");
adminRouter.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "adminLayout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
    helpers:{
      inc:function(value,options){
        return parseInt(value) + 1
      }

    }  })
);

//settiing up user Router
userRouter.set("views", path.join(__dirname, "views/user"));
userRouter.set("view engine", "hbs");
//to show where files are kept
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
    helpers:{
      limit:function(ary, max, options) {
        if(!ary || ary.length == 0)
            return options.inverse(this);
    
        var result = [ ];
        for(var i = 0; i < max && i < ary.length; ++i)
            result.push(options.fn(ary[i]));
        return result.join('');
    }
    }
  })
);
 
//setting up static files
userRouter.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/admin")));

//data base connection setting
mongoose.set("strictQuery", true);

mongoose.connect("mongodb://127.0.0.1:27017/upStyle", () => {
  console.log("DB connection established");
});

app.listen("5000", () => {
  console.log("server listening on port 5000");
});
