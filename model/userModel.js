const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
    name:{
        type:String,
        required : true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    mobile:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        required: true
    },
    isAvailable:{
        type:Boolean,
        required:true
    }
})







module.exports= mongoose.model('Users',userSchema)
//Users is the name of collection