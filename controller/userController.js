

const bcrypt = require('bcrypt')
const userModel = require('../model/userModel')




//page rendering functions

loadHome=(req,res)=>{
    const session = req.session.user_id
    res.render('home',{session})
}


loadCart=(req,res)=>{
    const session = req.session.user_id
    res.render('cart',{session})
}

loadContact=(req,res)=>{
    const session = req.session.user_id
    res.render('contact',{session})
}

loadProduct=(req,res)=>{
    const session = req.session.user_id
    res.render('productDetails',{session})
}

loadShop=(req,res)=>{
    const session = req.session.user_id
    res.render('shop',{session})
}

loadLogin=(req,res)=>{
    res.render('userLogin')
}

loadRegister=(req,res)=>{
    res.render('register')
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
        console.log(user+"user saved successfully")
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
    verifyLogin
}