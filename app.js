const express = require('express')
const app = express()
const hbs = require('express-handlebars')
const path = require('path')
const mongoose = require('mongoose')
const nocache = require('nocache')



//routes setting
const userRouter = require('./router/userRouter')
const adminRouter = require('./router/adminRouter')


// parsing incoming data's
app.use(express.json())
app.use(express.urlencoded({extended:true}))
//
app.use('/',userRouter)
app.use('/admin',adminRouter)

//setting view engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine','hbs')

//setting up admin router
adminRouter.set('views',path.join(__dirname,'views/admin'))
adminRouter.set('view engine','hbs')
adminRouter.engine('hbs',hbs.engine({extname:'hbs', defaultLayout:'adminLayout', layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))



//settiing up user Router
userRouter.set('views',path.join(__dirname,'views/user'))
userRouter.set('view engine','hbs')
//to show where files are kept 
userRouter.engine('hbs',hbs.engine({extname:'hbs', defaultLayout:'layout', layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))



//setting up static files
userRouter.use(express.static(path.join(__dirname,'public/user')))
app.use(express.static(path.join(__dirname,'public/admin')))



//data base connection setting
mongoose.set('strictQuery',true)

mongoose.connect('mongodb://127.0.0.1:27017/upStyle',()=>{
    console.log('DB connection established');
})







app.listen('5000' , ()=>{
    console.log('server listening on port 5000');
})










