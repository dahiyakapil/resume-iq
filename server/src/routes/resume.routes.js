import express from "express";
import { upload } from "../middlewares/upload.js";
import {
    aiSuggestionAnalyzeResume,
    analyzeResume,
    deleteResumeReport,
    downloadResumeReportPdf,
    getResumeReportById,
    getResumeReports,
    reanalyzeResume,
    rewriteAISuggestion
}
from "../controllers/resume.controller.js";
import { userAuth } from "../middlewares/auth.middleware.js";
import { generateUpdatedPdfWithRewrites } from "../controllers/generateUpdatedPdfWithRewrites.controller.js";



const resumeRouter = express.Router();

// POST /api/resume/analyze
resumeRouter.post("/analyze", userAuth, upload.single("resume"), analyzeResume);


resumeRouter.post("/ai-suggestion", userAuth, upload.single("resume"), aiSuggestionAnalyzeResume);

// GET /api/resume/history
resumeRouter.get("/history", userAuth, getResumeReports);


// DELETE /resume/:reportId
resumeRouter.delete("/:reportId", userAuth, deleteResumeReport);

resumeRouter.put("/reanalyze/:reportId", userAuth, reanalyzeResume);


// GET /api/resume/:reportId
resumeRouter.get("/:reportId", userAuth, getResumeReportById);


// GET /api/resume/download/:reportId
resumeRouter.get("/download/:reportId", userAuth, downloadResumeReportPdf);


// POST /rewrite-suggestions
resumeRouter.post("/rewrite/:reportId", userAuth, rewriteAISuggestion);


// POST /resume/download-updated/:reportId
resumeRouter.post("/download-updated/:reportId", userAuth, generateUpdatedPdfWithRewrites);




export default resumeRouter;
