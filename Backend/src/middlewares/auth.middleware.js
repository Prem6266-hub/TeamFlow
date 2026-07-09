const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async(req,res,next) => {
    try {
        let token = req.cookies.token || null;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
            return res.status(401).json({
                messgae: "Unauthorized",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        next(); 

    } catch (err) {
        return res.status(401).json({
      message: "Invalid Token",
    });
    }
}

const validate = (schema) => async(req,res,next) =>{
    const {error} = schema.validate(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message,
        })
    }
    next();
};

module.exports = { validate, protect };