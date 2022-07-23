const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statuses = {
    PICK_UP_REQUESTED:'PICK_UP_REQUESTED',
    PICKED_UP : 'PICKED_UP',
    IN_TRANSIT: 'IN_TRANSIT',
    WAREHOUSE: 'WAREHOUSE',
    DELIVERED: 'DELIVERED'
}

const OrderSchema =  new Schema({
    user : { type: Schema.Types.ObjectId, ref: 'User' },
    airwaybill_no : {
        type : String,
        required: true
    },
    item_name: {
        type : String,
        required : true,
        trim : true
    },
    item_type: {
        type : String,
        required : true,
        default : 'Light',
        enum : ['Light', 'Normal', 'Heavy']
    },
    size:{
        type: Number,
        default: null
    },
    delivery_status:{
        type: String,
        default : statuses.PICK_UP_REQUESTED,
        enum: {
            values: [statuses.PICK_UP_REQUESTED, statuses.PICKED_UP, statuses.IN_TRANSIT, statuses.WAREHOUSE, statuses.DELIVERED],
            message: "{VALUE} not permitted"
        },
        required: true
    },
    source_address:{
        type: String,
        default: null
    },
    destination_address:{
        type: String,
        default: null
    },
    price: {
        type: Number,
        default: 0
    },
    payment_status  : {
        type: String,
        enum: ['Piad', 'Unpaid'],
        default: "Unpaid"
    },
    createdAt:{
        type : Date,
        default : Date.now
    },
    updatedAt: {
        type : Date,
        default: null
    }
})

const Order = mongoose.model("Order", OrderSchema)
module.exports = Order