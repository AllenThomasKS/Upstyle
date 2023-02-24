const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const message = require('../config/sms');
const addressModel = require('../model/addressModel')
const orderModel = require('../model/orderModel')

require('dotenv').config()

const Razorpay = require('razorpay')

let newUser;

//page rendering functions

loadHome = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("home", { session, login });
};
const loadCart = async (req, res) => {
  try {
    const login = false;
    userSession = req.session;
    const userData = await userModel.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("cart.item.productId");
 
    res.render("cart", {
      login,
      id:userSession.user_id,
      cartProducts: completeUser.cart.item,
      total:completeUser.totalPrice
    });
  
  } catch (error) {
    console.log(error);
  }
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
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (passwordMatch) {
        if (userData.isAvailable) {
          req.session.user_id = userData._id;
          req.session.user_name = userData.name;
          res.redirect("/");
        } else {
          res.render("login", {
            message: "You are Blocked by the administrator",
          });
        }
      } else {
        res.render("login", { message: "Invalid password" });
      }
    } else {
      res.render("login", { message: "Account not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};
 

const loadOtp =async (req, res) => {
    const userData = newUser
    console.log(userData);

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



//cart management

const addToCart = async (req, res, next) => {
  try {

    console.log(req.body);
    const productId = req.body.id;
    userSession = req.session;
    const userData = await userModel.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });
    console.log(productData);
      await userData.addToCart(productData);
          res.redirect("/shop");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const productId = req.query.id;
    userSession = req.session;

    const userData = await userModel.findById({ _id: userSession.user_id });
    await userData.removefromCart(productId);
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

//wishlist management

const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log(productId)
    userSession = req.session;
    const userData = await userModel.findById({ _id: userSession.user_id });
    console.log(userData);
    const productData = await productModel.findById({ _id: productId });
    console.log(productData)
    userData.addToWishlist(productData);
    res.redirect("/shop");
  } catch (error) {
    console.log(error.message);
  }
};

const loadWishlist = async (req, res) => {


  try {
    userSession = req.session
    const userData = await userModel.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("wishlist.item.productId");

    res.render("wishlist", {
      id: userSession.user_id,
      products: completeUser.wishlist.item,
    });

  } catch (error) {

    console.log(error.message);
    
  }


};

const addCartDeleteWishlist = async (req, res) => {
  try {
    userSession = req.session;
    const productId = req.query.id;
    const userData = await userModel.findById({ _id: userSession.user_id });
    const productData = await productModel.findById({ _id: productId });
    const add = await userData.addToCart(productData);
    if (add) {
      await userData.removefromWishlist(productId);
    }
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  } 
};

const deleteWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await userModel.findById({ _id: userSession.user_id });
    await userData.removefromWishlist(productId);
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  }
};
 
//checkout

const loadCheckout = async (req,res) => {

  const userId = req.session.user_id;

  const user = await userModel.findById({_id: userId})

  const completeUser = await user.populate("cart.item.productId");

  const address = await addressModel.find({userId:userId})
  res.render('checkout',{add:address, totalPrice:completeUser.cart.totalPrice})

}

const addAddress =async (req,res) => {
  try {
      const userSession = req.session
      const addressData = addressModel({
        name:req.body.name,
        userId:userSession.user_id,
        address:req.body.address,
        city:req.body.city,
        state:req.body.state,
        zip:req.body.zip,
        mobile:req.body.mobile,
      })
  
      await addressData.save().then(()=>console.log('Address saved'))
        res.redirect('/checkout')
      
    
  } catch (error) {
    console.log(error.message);
  }
  }
  
const loadOrderSummary = (req, res) => {

    res.render('ordersummary')
    
    };
    
const loadOrderSuccess = (req, res) => {
    
      res.render('orderSuccess')
    
}
const placeOrder = async (req, res) => {
  try {
    userSession = req.session;

    const addressId = req.body.addressId;

    // console.log("addressId ", addressId);

    const userData = await userModel.findById({ _id: userSession.user_id });

    const completeUser = await userData.populate("cart.item.productId");

    if (completeUser) {
      const address = await addressModel.findById({ _id: addressId });

      let order  

      console.log("address", address);
      if (address) {
         order = await orderModel({
          userId: userSession.user_id,
          payment: req.body.payment,
          name: address.name,
          address: address.address,
          city: address.city,
          state: address.state,
          zip: address.zip,
          mobile: address.mobile,
          products: completeUser.cart,
        });

        console.log(completeUser.cart.item);

        
 
        

      
      } else {
        console.log("order not saved");
      }

      if (req.body.payment == "cod") {

        res.render("orderSuccess");
        order.save().then(() => console.log("order saved"));
       
      } else  {
        res.render("razorpay",{total:completeUser.cart.totalPrice})
        order.save().then(() => console.log("order saved"));
      }
    } else {
    }
  } catch (error) {

  }
};


const loadForgetPassword = (req, res) => {
  res.render('forgetpassword',{login:true})
}

const forgetPassword = async (req, res) => {
  try {

    const mobile = req.body.mobile
    const user = await userModel.findOne({ mobile: mobile})
   if (user) {
     newOtp = message.sendMessage(mobile,res)
     console.log('Forget tp',newOtp);   
     res.render('forgetOtp',{newOtp,userData:user,login:true,})
   } else {
    res.render('forgetpassword',{message:"No user found"})
   }

    
  } catch (error) {

    console.log(error.message);
    
  }
}

const verifyForgetPassword = (req, res) => {
    
   try {

     const otp = req.body.otp
     const newOtp = req.body.newotp

     const id = req.body.id

     if (otp == newOtp) {

      res.render('changePassword',{id,login:true})
      
     } else {

      res.render('forgetOtp',{id:id,login:true,message:'Invalid OTP'})
      
     }
    
   } catch (error) {
    
   }
}


const changePassword = async (req, res) =>{

  const id = req.body.id;
  console.log(id);

  const currentPassword = req.body.currentPassword;

  console.log(currentPassword);

  const userData = await userModel.findById({_id:id})

  console.log(userData);

  const passwordMatch =await bcrypt.compare(req.body.currentPassword,userData.password)

  console.log(passwordMatch);

  if(passwordMatch){
 
    const newPass = await bcrypt.hash(req.body.password,1) 
    const user = await userModel.findByIdAndUpdate({_id:id}, {$set:{

      password:newPass


    }}).then(()=>{
      res.render('userLogin',{login:true,message:'Password Changed successfully'})
    })

  }else{
    console.log('not updated');
  }
 
}

const loadEditAddress = async (req, res) => {

  const addressId = req.query.id

  console.log(addressId);

  const address =await  addressModel.findById({_id: addressId}).exec((err,address)=>{
    console.log(address);

    res.render('editaddress', {address,addressId})
  })

 


}  


const editAddress = async (req, res) => {

  const addressId = req.body.id

  console.log(addressId);

   await addressModel.findByIdAndUpdate({_id: addressId},{$set:{
    name: req.body.name,
    address: req.body.address,
    city: req.body.city, 
    state: req.body.state,
    zip: req.body.zip,
    mobile: req.body.mobile,
  }}).then(()=>console.log('address updated'))

  res.redirect('/address')

}
 
const deleteAddress = async  (req,res) => {
   

  const  id = req.query.id

  await addressModel.findByIdAndDelete({_id: id}).then(()=>console.log('address deleted'))

  res.redirect('/address')



}
 
//user profile


const loadUserProfile = async (req, res) => {
  const session = req.session;

  userModel.findById({ _id: session.user_id }).exec((err, user) => {
    res.render("userProfile", { user, session: req.session.user_id });
    console.log(user.image);
  });
}; 

const loadEditUserProfile = async (req, res) => {
  const session = req.session;

   userModel.findById({ _id: session.user_id }).exec((err, user) => {
    res.render("editUserProfile", { user });
  });
};

const editUserProfile = async (req, res) => {
  const id = req.session.user_id;;

  const user = await userModel
    .findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          dob: req.body.dob,
        },
      }
    )
    .then(() => {
      res.redirect("/editProfile",);
    }).then(()=>console.log('edited'))
};

const payment = async (req, res) => {
  userSession = req.session;
  const userData = await userModel.findById({_id:userSession.user_id});
  const completeUser = await userData.populate('cart.item.productId');
  var instance = new Razorpay({
      key_id:process.env.PAYMENT_KEY,
      key_secret:process.env.PAYMENT_SECRET,
  })
  
  console.log(completeUser.cart.totalPrice);
  let order = await instance.orders.create({
      amount:completeUser.cart.totalPrice * 100,
      currency:"INR",
      receipt:"receipt#1"
  })
  res.status(201).json({
      success:true,
      order,
  });
  }

  
const loadAddress = async (req,res) => {

  const userId = req.session.user_id;

  const user = await userModel.findById({_id: userId})

 
  const address = await addressModel.find({userId:userId})
  res.render('address',{add:address,})

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
  addToCart,
  deleteCart,
  addToWishlist,
  loadWishlist,
  addCartDeleteWishlist,
  deleteWishlist,
  loadCheckout,
  addAddress,
  loadOrderSuccess,
  loadOrderSummary,
  loadForgetPassword,
  forgetPassword,
  verifyForgetPassword,
  changePassword,
  loadEditAddress,
  editAddress,
  deleteAddress,
  loadUserProfile,
  loadEditUserProfile,
  editUserProfile,
  payment,
  placeOrder,
};
