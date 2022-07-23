const jwt = require("jsonwebtoken")

const verifyToken = async (req, res, next) => {
    
    let authorization = req.headers['authorization']
    if (!authorization)
        return res.status(403).json({error: "An athorization header is required"})
    let token = await authorization.split(" ")[1]
    // return console.log(process.env.JWT_SECRET)
    if(!token)
        return res.status(403).json({error: "token required"})

    try {
        const checkToken = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = checkToken.userId
        // console.log(checkToken.userId)
    } catch (err) {
        return res.status(401).json({error:err.message})
    }
    return next()
}

module.exports = verifyToken;