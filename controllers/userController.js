const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

async function hashPassword(password){
    return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword){
    return await bcrypt.compare(plainPassword, hashedPassword);
}

//sign up with email and password
exports.signup = async (req, res, next) => {
    try{
        if (req.body.role && (req.body.role == "admin" || req.body.role == "rider")){
            res.status(403).json({error:"error", message:"Only an admin user can add another admin user"})
        }
        const {email, password, role, firstname, lastname} = req.body
        const hashedPassword = await hashPassword(password)
        const newUser = new User({email, password:hashedPassword, firstname, lastname, role})
        /* const accessToken = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET, {
            expiresIn: "2h"
        }); */
        // newUser.accessToken = accessToken;
        // await newUser.save();
        res.json({
            data: {email:newUser.email, firstname:newUser.firstname, lastname:newUser.lastname, role:neUser.role }
        });
    } catch (err){
        next(err)
    }
}


//login method
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user) 
            return next(new Error('Email does not exist'));
        const validPassword = await validatePassword(password, user.password);
        if (!validPassword) 
            return next(new Error('Password is not correct'))
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30m"
        });
        await User.findByIdAndUpdate(user._id, { accessToken })
        res.status(200).json({data: { _id: user._id, email: user.email, role: user.role }, accessToken})
    } catch (error) {
        next(error);
    }
}