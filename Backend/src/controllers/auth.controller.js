const User = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const register = async(req,res) => {
    try {
        const {name, email, password} = req.body;
        
        const existingUser = await User.findOne({
            email,
        });

        if(existingUser){
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const user = User.create({
            name, email, password: hashedPass,
        })

        const token = generateToken(user._id);

        res.status(201).json({
            message: "User Registered",
            token,
            user,
        });

    } catch (err) {
        res.status(500).json({
            message: "Failed to register",
        });
    }
}

const login = async(req,res) => {
    try {
        const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({
            message: "Invalid credentials",
        });
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if(!isMatch){
        return res.status(400).json({
            message: "Invalid credentials",
        });
    }

    const token = generateToken(user._id);

    res.status(300).json({
        message: "USer logged in",
        token,
        user,
    });

    } catch (err) {
        res.status(500).json({
            message: "Failed to login",
        });
    }
    
}


module.exports = {register, login,};