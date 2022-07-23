const express = require('express');
const router = express.Router();
const {login, signup} = require('../controllers/userController')
const {createOrder, getAllMyOrders, updateOrder, 
    updateOrderStatus, ListAllOrders, getSingleOrder, cancelOrder} 
= require('../controllers/orderController')
const verifyToken  =  require('../middlewares/authMiddleware')

/* Base url
@return text to welcome you to  */
router.get('/', (req, res) =>{
    res.json({message:"Welcome to ABC LOGISTICS api"});
})

/*Sign up 
@return object
*/
router.post('/signup', signup);

/*login*/
router.post('/login', login);

router.use(verifyToken)

router.post('/api/createOrder', createOrder)
router.get('/api/getMyOrders', getAllMyOrders)
router.patch('/api/updateOrder/:orderId', updateOrder)
router.patch('/api/updateOrderStatus/:orderId', updateOrderStatus)
router.get('/api/listOrders/', ListAllOrders)
router.get('/api/singleOrder/:orderId', getSingleOrder)
router.delete('/api/cancelOrder/:orderId', cancelOrder)

module.exports = router