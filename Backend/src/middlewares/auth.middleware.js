const express = require("express");
// const validate = require("../validators/auth.validator")

const validate = (schema) => async(req,res,next) =>{
    const {error} = schema.validate(req.body);

    if(error){
        return res.status(400).json({
            message: error.details[0].message,
        })
    }
    next();
};

module.exports = validate;