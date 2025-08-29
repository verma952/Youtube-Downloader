import express from "express";
import { getFormats, streamVideo } from "../controllers/videoController.js";

const router = express.Router();

router.post("/download", getFormats);
router.get("/stream", streamVideo);

export default router;
