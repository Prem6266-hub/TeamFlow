const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.route");

const cors = require("cors");
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// app.get("/", (req,res)=>{
//     res.send("TeamFlow is running");
// })

app.use("/api/auth", authRoutes)


const startServer = async(req,res) => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        res.status(500).json({message: "Failed to start Server", err: err.message});
    }
}
startServer();