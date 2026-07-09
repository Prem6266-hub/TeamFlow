const express = require("express");

const router = express.Router();

const {
    register, login, getMe, logout
} = require("../controllers/auth.controller");

const {
    registerSchema, loginSchema
} = require("../validators/auth.validator");

const authMiddleware = require("../middlewares/auth.middleware");



router.post("/register", authMiddleware.validate(registerSchema), register);

router.post("/login", authMiddleware.validate(loginSchema), login);

router.get("/me", authMiddleware.protect,getMe);


router.post("/logout", logout);

module.exports = router;