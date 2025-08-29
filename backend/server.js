import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import videoRoutes from "./routes/videoRoutes.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/video", videoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
