const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.route");
const cors = require("cors");;
const cookieParser = require("cookie-parser");
const workRouter = require("./src/routes/workspace.route");
const projectRouter = require("./src/routes/project.routes");
const taskRouter = require("./src/routes/task.route");
const dashRouter = require("./src/routes/dashboard.route");
const notificationRouter = require("./src/routes/notification.route");
const newsletterRouter = require("./src/routes/newsletter.route");
const http = require("http");
const {Server} = require("socket.io");
const {socketHandler} = require("./src/socket/socket");
const aiRouter = require("./src/ai/ai.route")

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {origin: "*", credentials: true},
});

socketHandler(io);

app.set("io", io);

dotenv.config();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors({
    origin: ["http://localhost:5175","http://localhost:5173"],
    credentials: true,
}));

const PORT = process.env.PORT || 3000;

// app.get("/", (req,res)=>{
//     res.send("TeamFlow is running");
// })

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workRouter);
app.use("/api/projects", projectRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/dashboard", dashRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/ai", aiRouter);




server.listen(PORT, async() => {
    try {
        await connectDB();
        console.log(`Server running on port ${PORT}`);
    } catch (err) {
        console.log("Failed to start server: ", err.message);
    }
});

// const startServer = async(req,res) => {
//     try {
//         await connectDB();

//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     } catch (err) {
//         console.log("Failed to start server: ", err.message);
//     }
// }
// startServer();