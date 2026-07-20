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

        const user = await User.create({
            name, email, password: hashedPass,
        })

        const token = generateToken(user._id);

        res.cookie("token", token,{
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7*24*60*60*1000, // 7 days
        });

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

    res.cookie("token", token, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7*24*60*60*1000, // 7 days
    })

    res.status(200).json({
        message: "User logged in",
        token,
        user,
    });

    } catch (err) {
        res.status(500).json({
            message: "Failed to login",
        });
    }
    
}

const getMe = async(req,res) => {
    try {
        res.status(200).json({
            user: req.user,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to get user info",
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body || {};
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (typeof name === "string" && name.trim()) {
            user.name = name.trim();
        }

        if (typeof email === "string" && email.trim()) {
            const normalizedEmail = email.trim().toLowerCase();
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = normalizedEmail;
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select("-password");

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (err) {
        console.error("Profile update failed", err);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

const logout = async(req,res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            // secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.status(200).json({
            message: "Logged out successfully",
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to logout",
        });
    }
}


module.exports = {register, login, getMe, updateProfile, logout};