import { analyzeJobMatch } from "../utils/analyzeJobMatch.js";
import fs from "fs/promises";
import PDFParser from "pdf2json";
import JobMatchSchema from "../models/jobMatchSchema.model.js";

export const jobMatchController = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file || !jobDescription) {
      console.log("Missing file or job description");
      return res.status(400).json({ error: "PDF and job description required" });
    }

    console.log("📄 Received file:", req.file);
    const filePath = req.file.path;

    const pdfBuffer = await fs.readFile(filePath);
    console.log("✅ PDF loaded from path");

    // ✅ Extract text with pdf2json
    const resumeText = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      pdfParser.on("pdfParser_dataError", err => reject(err.parserError));
      pdfParser.on("pdfParser_dataReady", pdfData => {
        const text = pdfData.Pages.map(page =>
          page.Texts.map(t => decodeURIComponent(t.R[0].T)).join(" ")
        ).join("\n");
        resolve(text);
      });
      pdfParser.parseBuffer(pdfBuffer);
    });

    console.log("✅ Resume text extracted");

    const result = await analyzeJobMatch(resumeText, jobDescription);
    console.log("✅ AI result:", result);

    const newReport = new JobMatchSchema({
      user: req.user._id,
      resumeText,
      jobDescription,
      result,
    });

    await newReport.save();
    console.log("✅ Saved to DB");

    return res.json({
      message: "Job match analysis saved successfully",
      data: newReport,
    });
  } catch (err) {
    console.error("❌ Match error:", err.message);
    res.status(500).json({ error: "Failed to analyze job match" });
  }
};
