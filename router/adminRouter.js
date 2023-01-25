const express = require('express')
const route = express()
const adminController = require('../controller/adminController')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const config = require('../config/config')
const adminAuth = require('../middleware/adminAuth')
const nocache = require('nocache')
const upload = require('../util/multer')
 

route.use(express.json())
route.use(express.urlencoded({extended:true}))

route.use(nocache())
//session 
route.use(cookieParser())

route.use(session({
    secret: config.secretKey,
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: config.maxAge,
    }

}))


route.get('/',adminAuth.isLogin,adminController.loadLogin)

route.get('/products',adminAuth.isLogout,adminController.loadProduct)

route.get('/addProducts',adminAuth.isLogout,adminController.loadAddProduct)

route.get('/users',adminAuth.isLogout,adminController.loadUsers)

route.get('/dashboard',adminAuth.isLogout,adminController.loadDashboard)

route.get('/logout',adminAuth.logout)

route.get('/editProduct',adminController.loadEditProduct)

route.get('/block',adminController.blockUser)

route.get('/stock',adminController.inStock)


//post methods

route.post('/',adminController.verifyLogin)

route.post('/addProducts',adminController.upload,adminController.addProduct,adminController.loadAddProduct)

route.post('/update',adminController.editProduct)



module.exports = route
