const userModel = require('../model/userModel')
const bcrypt = require('bcrypt')
const productModel = require('../model/productModel')
// const upload = require('../util/multer')







const multer = require('multer')
const path = require('path')


const Storage = multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'./public/admin/assets/img/products')
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

const loadProduct = async(req,res)=>{
   try {
	 const productData = await productModel.find({}).exec((err,product)=>{
	        if(product){
	            console.log(product);
	            res.render('product',{product})
	        }else{
	            res.send('404 page not found')
	        }
	    })
} catch (error) {
	console.log(error.message);
}

}

const loadAddProduct =(req,res)=>{
    res.render('addProducts')
}

const loadUsers =async (req,res)=>{
    try {
        const userData = await userModel.find({}).exec((err,user)=>{
            if (user) {
                console.log(user);
                res.render('users',{user})
            }
        })
    } catch (error) {
        console.log(error.message);
    }
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



const editProduct = (req,res,next)=>{
   try {
       productModel.findByIdAndUpdate({_id:req.body.ID},{$set:{
        name : req.body.name,
        price : req.body.price,
        category : req.body.category,
        description : req.body.description,
        // image: req.body.image
       }}).then(()=>{res.redirect('/admin/products')})

       res.redirect('/admin/product')
   } catch (error) {
    console.log(error.message);
   }
}

const loadEditProduct =  (req,res)=>{

    try {
        
    productModel.findById({_id:req.query.id}).exec((err,product)=>{

        if (product) {

            res.render('editProduct',{product})
            
        }

        })
    } catch (error) {
        console.log(error.message);
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
    upload,
    editProduct,
    loadEditProduct
}