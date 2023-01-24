const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const productModel = require('../model/productModel')
// const upload = require('../util/multer')







const multer = require('multer')
const path = require('path')


const Storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'./public/productImages')
    },
    filename: (req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
    }
})


const upload = multer({
    storage: Storage 
}).single('images')










const loadDashboard = (req,res)=>{
    res.render('dashboard')
}

const loadProduct = (req,res)=>{
    res.render('product')
}

const loadAddProduct = (req,res)=>{
    res.render('addProducts',)
}

const loadUsers = (req,res)=>{
    
    res.render('users')
}

const loadLogin = (req,res)=>{
    const logout = true
    res.render('login',{logout})
}

const addProduct = async(req,res,next)=>{
    try {
        const product = new productModel({
            name : req.body.product,
            category : req.body.category,
            price : req.body.price,
            description : req.body.description,
            isAvailable : true,
            image : req.file.filename
        })
        await product.save().then(()=>{
            console.log('product saved');
        })
        next()
        
    } catch (error) {
        console.log(error.message);
    }
}


//post methods

async function verifyLogin(req, res, next) {
    try {
        const email = req.body.email
        const userData = await userModel.findOne({ email:email })

        if (userData) {
            const passwordMatch = await bcrypt.compare(req.body.password, userData.password)
            if (passwordMatch) {
                if (userData.isAdmin) {
                    req.session.admin_id = userData._id
                    req.session.admin_name = userData.name

                    res.redirect('/admin')
                } else {
                    res.render('login', { message: 'you are not an admin' })
                }



            } else {
                res.render('login', { message: 'password incorrect' })
            }
        } else {
            res.render('login', { message: 'account not found' })
        }
    }


    catch (error) {
        console.log(error.message)
    }
}





module.exports = {
    loadDashboard,
    loadProduct,
    loadAddProduct,
    loadUsers,
    loadLogin,
    verifyLogin,
    addProduct,
    upload
}