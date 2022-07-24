const User = require('../models/user')
const Order = require('../models/order');
// const validateStatus = require('../middlewares/validateStatus');

function generateRndomString(lengthOfString){
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < lengthOfString; i++) {
        token += characters[Math.floor(Math.random() * characters.length )];
    }
    return token
}

const getloggedInUser = (req)=>{
    const loggedInUser = User.findById(req.user);
    return loggedInUser
}

const checkUserValidityForResource = (userid, resourceUserId) => {
    if(userid == resourceUserId){
        return true
    }
    return false
}

const calculatePrice = (determinant) => {
    if (determinant == null || determinant == "Light"){
        price = 2000
        return prie
    }else if(determinant == "Normal"){
        price = 4000
        return price
    }else{
        price = 7000
        return price
    }
}

const validateStatus = (orderDetails, req)=>{
    const acceptedValues = ["PICKED_UP", "IN_TRANSIT", "WAREHOUSE", "DELIVERED"]
            
    //check if input is valid
    if (acceptedValues.includes(req.body.delivery_status) == false){
        return res.status(400).json({"error":"You did not supply any of the accepted values"})
    }

    //making sure delivery status is not updated twice at PICKED_UP and at DELEIVERED
    if (orderDetails.delivery_status == "PICKED_UP" && req.body.delivery_status == "PICKED_UP" || orderDetails.delivery_status == "DELIVERED" && req.body.delivery_status == "DELIVERED"){
        return res.status(403).json({"error":"Ooops! You cannot update status at this level more than once"})
    }

    //Avoiding Jumping steps from first to last and vice-versa
    if (orderDetails.delivery_status == "PICKED_UP" && req.body.delivery_status == "DELIVERED"){
        return res.status(403).json({"error":"Ooops! You cannot update status at this way:jumping steps"})
    }else if(orderDetails.delivery_status == "DELIVERED" && req.body.delivery_status == "PICKED_UP"){
        return res.status(403).json({"error":"This is already delivered"})
    }

    // Avoid moving to picked up from any stage
    if (orderDetails.delivery_status == "WAREHOUSE" && req.body.delivery_status == "PICKED_UP"
    || orderDetails.delivery_status == "IN_TRANSIT" && req.body.delivery_status == "PICKED_UP"
    ){
        return res.status(403).json({"error":"Ooops! You cannot go back to this step"})
    }

}

exports.createOrder = async(req, res, next) => {
    try{
        const airwaybillNum  = generateRndomString(7)
        const user = req.user
        const { item_name, item_type, size} = req.body
        const newOrder =  new Order({item_name:item_name, item_type:item_type, 
            airwaybill_no:airwaybillNum, size:size, price: calculatePrice(item_type), user:user});
        await newOrder.save();
        return res.status(201).json({message:'successfully saved', data: newOrder})
    } catch (err) {
        res.send(err)
    }
}

exports.getAllMyOrders = async(req, res) => {
    try{
        const orders = await Order.find({user:req.user})
        res.status(200).json({data:orders, message:"Succesfully fetch all your orders"})
    } catch(err){
        next(err)
    }
}

//User update his own order before pick up
/* @return Object */
exports.updateOrder = async(req, res) => {
    try{
        if (req.body.status){
            return res.status(403).json({"error":"You cannot update status"})
        }
        OrderId =  req.params.orderId
        const order = await Order.findById(OrderId)
        if (checkUserValidityForResource(req.user, order.user) === false){
            return res.status(401).json({"error":"looks like you did not create this resource"})
        }
        const loggedInUser = await getloggedInUser(req)
        if(loggedInUser.role == "customer" && order.delivery_status == "PICK_UP_REQUESTED" || loggedInUser.role == "admin"){
            let attrubutesToUpdate = req.body
            await Order.findByIdAndUpdate(OrderId, attrubutesToUpdate); 
            return res.status(200).json({"message":"successfully updated"})
        }
        return res.status(403).json({"error":"you cannot update now"})
    }catch(err){
        res.send(err)
    }
}

//Update Status
/* @return Object */
exports.updateOrderStatus = async(req, res) => {
    try{
        const loggedInUser = await getloggedInUser(req);
        if (loggedInUser.role == "admin" || loggedInUser.role == "rider"){
            const OrderId = req.params.orderId;
            const orderDetails = await Order.findById(OrderId)

            const acceptedValues = ["PICKED_UP", "IN_TRANSIT", "WAREHOUSE", "DELIVERED"]
                    
            //check if input is valid
            if (acceptedValues.includes(req.body.delivery_status) == false){
                return res.status(400).json({"error":"You did not supply any of the accepted values"})
            }
        
            //making sure delivery status is not updated twice at PICKED_UP and at DELEIVERED
            if (orderDetails.delivery_status == "PICKED_UP" && req.body.delivery_status == "PICKED_UP" || orderDetails.delivery_status == "DELIVERED" && req.body.delivery_status == "DELIVERED"){
                return res.status(403).json({"error":"Ooops! You cannot update status at this level more than once"})
            }
        
            //Avoiding Jumping steps from first to last and vice-versa
            if (orderDetails.delivery_status == "PICKED_UP" && req.body.delivery_status == "DELIVERED"){
                return res.status(403).json({"error":"Ooops! You cannot update status at this way:jumping steps"})
            }else if(orderDetails.delivery_status == "DELIVERED" && req.body.delivery_status == "PICKED_UP"){
                return res.status(403).json({"error":"This is already delivered"})
            }
        
            // Avoid moving to picked up from any stage
            if (orderDetails.delivery_status == "WAREHOUSE" && req.body.delivery_status == "PICKED_UP"
            || orderDetails.delivery_status == "IN_TRANSIT" && req.body.delivery_status == "PICKED_UP"
            ){
                return res.status(403).json({"error":"Ooops! You cannot go back to this step"})
            }
            
            
            let updateData = req.body.delivery_status;
            let updatedAt = await new Date();
            await Order.findByIdAndUpdate(OrderId, {delivery_status:updateData, updatedAt:updatedAt, payment_status:'Paid'});
            const updatedOrder = await Order.findById(OrderId)
            return res.status(200).json({message:'Updated', data:updatedOrder})   
        }
        return res.status(401).json({error:"error", message:"Only a rider or an admin can take this action"})       
    } catch(err){
        res.send(err)
    } 
}


//Admin/Rider Listing all pickup requests
exports.ListAllOrders = async (req, res)=>{
    try{
        const loggedInUser = await getloggedInUser(req);
        if(loggedInUser.role == "admin" || loggedInUser.role == "rider"){
            const orders = await Order.find().populate("user");
            return res.status(200).json({data:orders, message:"Succesfully fetch all your orders"})
        }

        res.status(401).json({"error":"Only admins can get this data"})
    }catch(err){
        res.send(err)
    }
}

/* Retrive a single Orde
@return Object of one order
*/
exports.getSingleOrder = async(req, res) => {
    try{
        const order = await Order.findOne({_id:req.params.orderId}).populate("user")
        return res.status(200).json({data:order, message:"Order retrieved successfully"})
    }catch(err){
        res.send(err)
    }
}


//User cancels(deletes) before pickup
exports.cancelOrder= async(req, res) => {
    try{
        const OrderId = req.params.orderId
        // return res.send(OrderId)
        const order = await Order.findById(OrderId)
        if(JSON.stringify(order) == "{}"){
            return res.status(404).json({"error":"Order not found"})
        }
        const loggedInUser = await getloggedInUser(req)
        if(loggedInUser.role == "customer" && order.delivery_status == "PICK_UP_REQUESTED" || loggedInUser.role == "admin"){
            await Order.findByIdAndDelete(OrderId); 
            return res.status(204).json({"message":"Item deleted"});
        }
        return res.status(403).json({"error":"You cannot cancel this order"})
    }catch(err){
        res.send(err)
    }
}