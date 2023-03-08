const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const message = require('../config/sms');
const addressModel = require('../model/addressModel')
const orderModel = require('../model/orderModel')

require('dotenv').config()

const Razorpay = require('razorpay')

let newUser;
let order


//page rendering functions

loadHome = (req, res) => {
  const session = req.session.user_id;
  const login = false;
  res.render("home", { session, login });
};
const loadCart = async (req, res) => {
  try {
    userSession = req.session;
    const userData = await userModel
      .findById({ _id: userSession.user_id })
      .populate("cart.item.productId");
    const completeUser = await userData.populate("cart.item.productId");

    res.render("cart", {
      
      id: userSession.user_id,
      cartProducts: completeUser.cart.item,
      total: completeUser.cart.totalPrice,
      session: req.session.user_id,
      userImage: req.session.userImg,
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

  console.log(userId);

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

const loadOrderDetail = async (req,res)=>{
  const userId = req.session.user_id
  await userModel.findById({_id:userId})

  const orderDetail = await orderModel.find( {userId: userId}).exec((err,data)=>{
    res.render("ordersummary",{session :req.session.user_id, order:data,userImage:req.session.userImg })
  })
}
  
const loadOrderSummary = (req, res) => {

    res.render('ordersummary',{ session: req.session.user_id, userImage:req.session.userImg })
    
    };
    
let noCoupon;
let updatedTotal;

const applyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body; //coupon code from input field using ajax
    const userSession = req.session;
    let message = "";
    let couponDiscount;
    console.log("coupon name", coupon);

    if (userSession.user_id) {
      const userData = await userModel.findById({ _id: userSession.user_id });

      const couponData = await couponModel.findOne({ code: coupon });

      updatedTotal = userData.cart.totalPrice;

      console.log(updatedTotal);

      if (couponData) {
        if (couponData.usedBy.includes(userSession.user_id)) {
          message = "coupon Already used";
          res.json({ updatedTotal, message });
        } else {
          req.session.couponName = couponData.code;
          req.session.couponDiscount = couponData.discount;
          req.session.maxLimit = couponData.maxLimit;
          console.log(req.session.couponName);
          console.log(req.session.couponDiscount);
          console.log(req.session.maxLimit);

          if (userData.cart.totalPrice < userSession.maxLimit) {
            updatedTotal =
              userData.cart.totalPrice -
              (userData.cart.totalPrice * userSession.couponDiscount) / 100;
            req.session.couponTotal = updatedTotal;
          } else {
            const percentage = parseInt(
              (userSession.couponDiscount / 100) * userSession.maxLimit
            );
            updatedTotal = userData.cart.totalPrice - percentage;
            console.log(updatedTotal);
            couponDiscount = parseInt(percentage);
            console.log("couponDiscount: " + couponDiscount);
            req.session.couponTotal = updatedTotal;
            console.log(userSession.couponDiscount);
          }
          console.log("total", req.session.couponTotal);

          res.json({ updatedTotal, message, couponDiscount });
        }
      } else {
        message = "The promotional code you entered is not valid.";
        res.json({ updatedTotal, message });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};


    const placeOrder = async (req, res) => {
      try {
        userSession = req.session;
        const addressId = req.body.addressId;
        const address = await addressModel.findById({ _id: addressId });
        const userData = await userModel
          .findById({ _id: userSession.user_id })
          .populate("cart.item.productId");
        const couponData = await couponModel.findOne({
          usedBy: userSession.user_id,
        });
        let totalPrice;
    
        if (couponData) {
          delete userSession.couponName,
            delete userSession.couponDiscount,
            delete userSession.couponTotal;
        }
    
        if (userData.cart.totalPrice > 2500) {
          totalPrice = userSession.couponTotal || userData.cart.totalPrice;
        } else {
          totalPrice = (userSession.couponTotal || userData.cart.totalPrice) + 50; //shipping charge rs 50
        }
    
        const couponName = userSession.couponName
          ? userSession.couponDiscount
          : "None";
    
        // console.log('totalPrice'+ couponName);
    
        console.log(userSession);
        console.log("address", address);
        console.log("totalPrice", totalPrice);
        console.log("userData", userData.cart);
        console.log("couponName", couponName);
        console.log("payment", req.body.payment);
    
        order = new orderModel({
          userId: userSession.user_id,
          payment: req.body.payment,
          name: address.name,
          address: address.address,
          city: address.city,
          state: address.state,
          zip: address.zip,
          mobile: address.mobile,
          products: userData.cart,
          price: totalPrice,
          couponCode: couponName,
        });
    
        req.session.order_id = order._id;
    
        console.log("order_id: " + order._id);
    
        if (req.body.payment == "cod") {
          console.log("success");
          console.log(order);
    
          res.redirect("/orderSuccess");
        } else {
          var instance = new RazorPay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
          });
          let razorpayOrder = await instance.orders.create({
            amount: totalPrice * 100,
            currency: "INR",
            receipt: order._id.toString(),
          });
          console.log("order Order created", razorpayOrder);
          res.render("razorpay", {
            userId: req.session.user_id,
            order_id: razorpayOrder.id,
            total: totalPrice,
            session: req.session,
            key_id: process.env.key_id,
            user: userData,
            order: order,
            orderId: order._id.toString(),
          });
        }
      } catch (error) {}
    };


    const loadOrderSuccess = async (req, res) => {
      try {
        if (userSession) {
          
          await order.save().then(() => {
            userModel
              .findByIdAndUpdate(
                { _id: req.session.user_id },
                {
                  $set: {
                    "cart.item": [],
                    "cart.totalPrice": "0",
                  },
                },
                { multi: true }
              )
              .then(() => {
                console.log("cart deleted");
          
                // Move the product quantity update code inside this block
                orderModel
                  .findById(order._id)
                  .populate("products.item.productId")
                  .then(async (order) => {
                    for (const product of order.products.item) {
                      await productModel.findByIdAndUpdate(
                        product.productId._id,
                        { $inc: { quantity: -1 } },
                        { new: true }
                      );
                    }
          
                    console.log("Quantity updated");
                  });
              });
          });
          
    
          res.render("orderSuccess", { session: req.session.user_id });
        }
      } catch (error) {}
    };

const cancelOrder = async (req, res) => {
  await orderModel.findOneAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: "Cancel",
      },
    }
  );
  console.log("cancelled order");
  res.redirect("/OrderDetails");
};

const viewOrders = async (req, res) => {

  const order = await orderModel.findOne({ _id: req.query.id });

  const completeData = await order.populate("products.item.productId");

  res.render("orderlist", {
    order: completeData.products.item,
    session: req.session.user_id,
  });
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
  const id = req.session.user_id;
  await userModel
    .findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          dob: req.body.dob,
          image: req.file.filename,
        },
      }
    )
    .then((user) => {
      req.session.userImg = user.image;
      console.log(user.image);
      res.redirect("/editProfile");
    })
    .then(() => console.log("edited"));
};

const payment = async (req, res) => {
  userSession = req.session;
  const userData = await userModel.findById({ _id: userSession.user_id });
  const completeUser = await userData.populate("cart.item.productId");
  var instance = new RazorPay({
    key_id:process.env.PAYMENT_KEY,
    key_secret:process.env.PAYMENT_SECRET,
  });

  console.log(completeUser.cart.totalPrice);
  let myOrder = await instance.orders.create({
    amount: completeUser.cart.totalPrice * 100,
    currency: "INR",
    receipt: "receipt#1",
  });

  console.log(myOrder);

  if (res.status(201)) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "success" });
  }
};

  
const loadAddress = async (req,res) => {

  const userId = req.session.user_id;

  const user = await userModel.findById({_id: userId})

 
  const address = await addressModel.find({userId:userId})
  res.render('address',{add:address,})

}

const updateCartItem = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const userId = req.session.user_id;

    const user = await userModel
      .findById(userId)
      .populate("cart.item.productId");

    const cartItem = user.cart.item.find(
      (item) => item.productId._id.toString() === productId.toString()
    );

    const productPrice = cartItem.productId.price;

    const qtyChange = qty - cartItem.qty;

    cartItem.qty = qty;
    cartItem.price = productPrice * qty;

    // recalculate the total price of the cart
    const totalPrice = user.cart.item.reduce(
      (acc, item) => acc + item.price,
      0
    );
    user.cart.totalPrice = totalPrice;

    // mark the cart and totalPrice fields as modified
    user.markModified("cart");
    user.markModified("cart.totalPrice");

    // save the updated user document
    await user.save().then((data) => {
      console.log(data);
    });

    // send the updated subtotal and grand total back to the client
    const subtotal = user.cart.item.reduce((acc, item) => acc + item.price, 0);
    // const grandTotal = subtotal + 45;

    res.json({ subtotal, productPrice, qtyChange });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating cart item");
  }
};

const orderFailed = async (req, res) => {

  try {
   // await order.status = "Attempted"
  
  
   //  console.log(order.status ,'orderStatus');
  
   await order.save().then(()=>{
      res.render('paymentFailed')
    })
  } catch (error) {
 
   console.log(error.message);
   
  }
 }
 
module.exports = {
  updateCartItem,
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
  cancelOrder,
  loadOrderDetail,
  viewOrders,
  orderFailed,
  applyCoupon,
};
