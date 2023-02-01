const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const message = require('../config/sms')

let newUser;

//page rendering functions

loadHome = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("home", { session, login });
};

loadCart = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("cart", { session, login });
};

loadContact = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("contact", { session, login });
};

loadProduct = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("products", { login, session });
};

loadShop = (req, res) => {
  try {
    const session = req.session.user_id;
    const login = false;

    productModel.find({}).exec((err, product) => {
      if (product) {
        res.render("shop", { session, product, login });
      } else {
        res.render("shop", { session, login });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

loadLogin = (req, res) => {
  let login = true;
  res.render("userLogin", { login });
};

loadRegister = (req, res) => {
  const login = true;
  res.render("register", { login });
};

loadProductDetails = async (req, res) => {
  const login = false;
  try {
    const session = req.session.user_id;

    console.log(req.query.id);

    const product = await productModel.findById({ _id: req.query.id });

    res.render("productDetails", { product, session, login });
  } catch (error) {
    console.log(error.message);
  }
};

// post methods

//register User

const registerUser = async (req, res, next) => {
  try {

    const userData = await userModel.findOne({email:req.body.email})
    const userData1 = await userModel.findOne({mobile:req.body.mobile})

    if (userData || userData1) {
        res.render('register',{message: 'This account already exists'})
    } else {
    
     newUser = {
      name: req.body.username,
      password: req.body.password,
      email: req.body.email,
      mobile: req.body.mobile,
      isAdmin: false,
    };
    
    next();
    }
   
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const userData = await userModel.findOne({ email });

    if (userData) {

        
      const passwordMatch = await bcrypt.compare(req.body.password,userData.password);
        

      if (passwordMatch) {
        if (userData.isAvailable) {
          req.session.user_id = userData._id;
          req.session.user_name = userData.name;

          res.redirect("/");
        } else {
          res.render("userLogin", { message: "you  are blocked by the admin" });
        }
      } else {
        res.render("userLogin", { message: "password is incorrect" });
      }
    } else {
      res.render("userLogin", { message: "account not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtp =async (req, res) => {
    const userData = newUser

    const mobile = userData.mobile

    newOTP = message.sendMessage(mobile,res)

    console.log(newOTP);

    res.render('otp',{newOTP, userData })

};

const verifyOtp =async (req, res, next) => {
 
  try {
	    const otp = req.body.newOtp
	    
        console.log(req.body.otp);
	
	    if (otp === req.body.otp) {
	        
	        const password = await bcrypt.hash(req.body.password,10)
            
            const user = new userModel({
                name: req.body.name,
                email:req.body.email,
                mobile:req.body.mobile,
                password:password,
                isAdmin:false,
                isAvailable:true
            })
            console.log(user);

            await user.save().then(()=>console.log('register successful'))
            if (user){
                res.render('userLogin')
            }else{
                res.render('otp',{message: 'invalid otp'})
            }

        } else{
            console.log('otp not match');
        }
} catch (error) {
	console.log(error.message);
}   

};

const loadAddress = (req,res)=>{
    res.render('address')
}

module.exports = {
  loadProduct,
  loadContact,
  loadCart,
  loadHome,
  loadShop,
  loadLogin,
  loadRegister,
  registerUser,
  verifyLogin,
  loadProductDetails,
  loadOtp,
  verifyOtp,
  loadAddress,
};
