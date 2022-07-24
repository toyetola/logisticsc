const validateStatus = (orderDetails, req, next)=>{
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

    return next()
}

module.exports = validateStatus