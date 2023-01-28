

const bcrypt = require('bcrypt')
const productModel = require('../model/productModel')
const { findById } = require('../model/userModel')
const userModel = require('../model/userModel')




//page rendering functions

loadHome=(req,res)=>{
    const session = req.session.user_id
    const login = false
    res.render('home',{session,login})
}


loadCart=(req,res)=>{
    const session = req.session.user_id
    const login = false
    res.render('cart',{session,login})
}

loadContact=(req,res)=>{
    const session = req.session.user_id
    const login = false
    res.render('contact',{session,login})
}

loadProduct=(req,res)=>{
    const session = req.session.user_id
    const login = false
    res.render('products',{login,session})
    
}

loadShop=(req,res)=>{
    try {
        const session = req.session.user_id
        const login = false
             
            productModel.find({}).exec((err,product)=>{
                if(product){
                    res.render('shop',{session,product,login})
                }else{
                    res.render('shop',{session,login})
                }
            })
    } catch (error) {
        console.log(error.message);
    } 
}

loadLogin=(req,res)=>{
       let login = true
    res.render('userLogin',{login})
}

loadRegister=(req,res)=>{
    const login = true
    res.render('register',{login})
}

loadProductDetails = async(req,res)=>{
    const login = false
   try {
	 const session = req.session.user_id

     console.log(req.query.id);
	
	   const product =await productModel.findById({_id:req.query.id})
	
	    res.render('productDetails',{product,session,login})
} catch (error) {

    console.log(error.message);
	
}
}


// post methods

//register User

const registerUser = async(req,res,next)=>{
    try {
        const password = await bcrypt.hash(req.body.password,10)
        const user = new userModel({
            name: req.body.username,
            password: password,
            email: req.body.email,
            mobile: req.body.mobile,
            isAdmin:false,
            isAvailable:true,
    
        })
       await user.save().then(()=>{
        req.session.user_id = req.body.name
       })
       next()
    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req,res,next)=>{
    try {
        const email = req.body.email
        const userData = await userModel.findOne({email})

        if (userData){
            const passwordMatch = await bcrypt.compare(req.body.password,userData.password)

            if(passwordMatch){
                if(userData.isAvailable){
                    req.session.user_id = userData._id
                    req.session.user_name = userData.name
                    
                    res.redirect('/')
                }else{
                    res.render('userLogin',{message:'you  are blocked by the admin'})
                }
            }else{
                res.render('userLogin',{message:'password is incorrect'})
            }
        }else{
            res.render('userLogin',{message: 'account not found'})
        }
    } catch (error) {
        console.log(error.message);
    }
}












module.exports={
    loadProduct,
    loadContact,
    loadCart,
    loadHome,
    loadShop,
    loadLogin,
    loadRegister,
    registerUser,
    verifyLogin,
    loadProductDetails
}
    
