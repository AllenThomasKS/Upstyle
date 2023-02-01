const mongoose = require('mongoose')

const Schema = mongoose.Schema()

const addressSchema = new Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type:String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    pin:{
        type: Number,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    }


})

module.exports = mongoose.model('Address',addressSchema)
