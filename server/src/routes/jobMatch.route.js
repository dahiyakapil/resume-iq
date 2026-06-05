import express from "express";
import multer from "multer";
import { userAuth } from "../middlewares/auth.middleware.js";
import { jobMatchController } from "../controllers/jobMatchController.controller.js";

const upload = multer({ dest: "uploads/" });

const jobMatchrouter = express.Router();
jobMatchrouter.post("/match", userAuth, upload.single("resume"), jobMatchController);

export default jobMatchrouter;
