const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const roles = require('../auth/roles');

const UserSchema = new Schema({
    firstname : {
        type : String,
        default: null
    },
    lastname : {
        type : String,
        default: null
    },
    email: {
        type : String,
        required : true,
        trim : true,
        unique: true
    },
    password: {
        type : String,
        required : true,
        select: false
    },
    role: {
        type : String,
        default : roles.CUSTOMER,
        enum : [roles.CUSTOMER, roles.AGENT, roles.ADMIN]
    },
    accessToken: {
        type: String,
        select: false
    },
    createdAt:{
        type : Date,
        default : Date.now
    },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
})

const User = mongoose.model("User", UserSchema);
module.exports = User

