
import fs from "fs";
import axios from "axios";
import tmp from "tmp-promise";
import { extractPdfText } from "../utils/extractPdfText.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { analyzeWithOpenRouter } from "../utils/analyzeWithOpenRouter.js";
import ResumeReport from "../models/ResumeReport.model.js";
import PDFDocument from "pdfkit";
import { rewriteAISuggestionWithOpenRouter } from "../utils/rewriteAISuggestionWithOpenRouter.js";
import { rewriteBulletPointsSequentially } from "../utils/rewriteSequentially.js";


// export const analyzeResume = async (req, res) => {
//   const filePath = req.file?.path;
//   const resumeName = req.file?.originalname || "resume.pdf";

//   try {
//     if (!filePath) return res.status(400).json({ error: "No file uploaded" });

//     const extractedText = await extractPdfText(filePath);
//     if (!extractedText || extractedText.trim().length < 20) {
//       return res.status(422).json({ error: "Text extraction failed or resume is too short" });
//     }

//     const resumeUrl = await uploadToCloudinary(filePath);
//     const aiReportRaw = await analyzeWithOpenRouter(extractedText);

//     const atsKeywords = [
//       "summary", "experience", "project", "skill", "education", "certification", "award", "honor"
//     ];

//     const buzzwords = (aiReportRaw.buzzwords || []).filter(
//       (word, index) =>
//         index < 15 && !atsKeywords.some((keyword) => word.toLowerCase().includes(keyword))
//     ).slice(0, 10);

//     const aiReport = {
//       ...aiReportRaw,
//       buzzwords,
//     };

//     // ✨ Rewrite suggestions (only from project section)
//     const lines = extractedText
//       .split("\n")
//       .map((l) => l.trim())
//       .filter(Boolean);

//     const projectSectionStart = lines.findIndex((line) =>
//       /projects?/i.test(line)
//     );
//     const projectSectionEnd = lines.findIndex(
//       (line, i) => i > projectSectionStart && /^(skills?|education|experience|certifications?|awards?)/i.test(line)
//     );

//     const projectLines = lines.slice(
//       projectSectionStart + 1,
//       projectSectionEnd > -1 ? projectSectionEnd : lines.length
//     );

//     const bulletPointsOnly = projectLines.filter((line) => {
//       const trimmed = line.trim();
//       const looksLikeBullet =
//         /^[\u2022\-•*]/.test(trimmed) || /^[A-Z].+\.$/.test(trimmed) || trimmed.length > 30;

//       const lower = trimmed.toLowerCase();
//       const skipPatterns = [
//         /\b(india|panipat|haryana|email|phone|contact|linkedin|github|\d{10})\b/,
//         /\bskills?\b/, /\bcss\b/, /\bhtml\b/, /\bjavascript\b/, /\breact\b/, /\bnode\b/
//       ];

//       return looksLikeBullet && !skipPatterns.some((p) => p.test(lower));
//     });



//     const rewrites = await Promise.all(
//       bulletPointsOnly
//         .filter((line) => {
//           const lower = line.toLowerCase();
//           const skipPatterns = [
//             /\b(india|panipat|haryana|email|phone|contact|linkedin|github|\d{10})\b/,
//             /\bskills?\b/, /\bcss\b/, /\bhtml\b/, /\bjavascript\b/, /\breact\b/, /\bnode\b/
//           ];

//           return (
//             line.length > 10 &&
//             !skipPatterns.some((p) => p.test(lower))
//           );
//         })
//         .map(async (line) => ({
//           original: line,
//           rewritten: await rewriteAISuggestionWithOpenRouter(line),
//         }))
//     );

//     const savedReport = await ResumeReport.create({
//       user: req.user._id,
//       fileUrl: resumeUrl,
//       aiFeedback: JSON.stringify(aiReport),
//       score: aiReport.ats_score || 0,
//       resumeName,
//       rewrites,
//     });

//     return res.status(200).json({
//       message: "Resume analyzed and saved successfully",
//       resumeUrl,
//       analysis: aiReport,
//       rewrites,
//       reportId: savedReport._id,
//       createdAt: savedReport.createdAt,
//       resumeName,
//     });
//   } catch (err) {
//     console.error("❌ Resume analysis failed:", err);
//     return res.status(500).json({ error: "Resume analysis failed: " + err.message });
//   } finally {
//     if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
//   }
// };



export const analyzeResume = async (req, res) => {
  const filePath = req.file?.path;
  const resumeName = req.file?.originalname || "resume.pdf";

  if (!filePath) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Step 1: Extract text
    const extractedText = await extractPdfText(filePath);
    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(422).json({ error: "Text extraction failed or resume too short" });
    }

    // Step 2: Start Cloudinary upload in parallel
    const uploadPromise = uploadToCloudinary(filePath);

    // Step 3: AI analysis
    const aiAnalysisPromise = analyzeWithOpenRouter(extractedText);

    // Step 4: Extract project bullet points for rewrite
    const lines = extractedText.split("\n").map((l) => l.trim()).filter(Boolean);
    const projectStart = lines.findIndex((line) => /projects?/i.test(line));
    const projectEnd = lines.findIndex(
      (line, i) => i > projectStart && /^(skills?|education|experience|certifications?|awards?)/i.test(line)
    );
    const projectLines = lines.slice(projectStart + 1, projectEnd > -1 ? projectEnd : lines.length);

    const bulletPoints = projectLines.filter((line) => {
      const trimmed = line.trim();
      const looksLikeBullet = /^[\u2022\-•*]/.test(trimmed) || /^[A-Z].+\.$/.test(trimmed) || trimmed.length > 30;
      const skipPatterns = [
        /\b(india|panipat|haryana|email|phone|contact|linkedin|github|\d{10})\b/,
        /\bskills?\b/, /\bcss\b/, /\bhtml\b/, /\bjavascript\b/, /\breact\b/, /\bnode\b/
      ];
      return looksLikeBullet && !skipPatterns.some((p) => p.test(trimmed.toLowerCase()));
    });

    // Step 5: Batch rewrite bullet points in a single call if possible
    // Step 5: Rewrite bullet points individually
    const rewrites = bulletPoints.length
      ? await Promise.all(
        bulletPoints.map(async (bp) => {
          try {
            const rewritten = await rewriteAISuggestionWithOpenRouter(bp);
            // Avoid bad rewrites like single letters or empty strings
            if (!rewritten || rewritten.length < 10) {
              return bp;
            }
            return rewritten;
          } catch (e) {
            console.error(`⚠️ Rewrite failed for: "${bp}"`, e.message);
            return bp;
          }
        })
      )
      : [];


    // Step 6: Wait for AI analysis & upload to finish
    const aiReportRaw = await aiAnalysisPromise;
    const resumeUrl = await uploadPromise;

    // Step 7: Filter buzzwords
    const atsKeywords = ["summary", "experience", "project", "skill", "education", "certification", "award", "honor"];
    const buzzwords = (aiReportRaw.buzzwords || [])
      .filter((w, i) => i < 15 && !atsKeywords.some((k) => w.toLowerCase().includes(k)))
      .slice(0, 10);

    const aiReport = { ...aiReportRaw, buzzwords };
    const aiWarning = aiReportRaw.ai_warning || aiReportRaw.error || null;

    // Step 8: Save report
    const savedReport = await ResumeReport.create({
      user: req.user._id,
      fileUrl: resumeUrl,
      aiFeedback: JSON.stringify(aiReport),
      score: aiReport.ats_score || 0,
      resumeName,
      rewrites: bulletPoints.map((line, idx) => ({
        original: line,
        rewritten: rewrites[idx] || line
      })),
    });

    return res.status(200).json({
      message: aiWarning
        ? "Resume saved with limited AI analysis"
        : "Resume analyzed and saved successfully",
      resumeUrl,
      analysis: aiReport,
      rewrites: savedReport.rewrites,
      reportId: savedReport._id,
      createdAt: savedReport.createdAt,
      resumeName,
      warning: aiWarning,
    });
  } catch (err) {
    console.error("❌ Resume analysis failed:", err);
    return res.status(500).json({ error: "Resume analysis failed: " + err.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};





export const aiSuggestionAnalyzeResume = async (req, res) => {
  const filePath = req.file?.path;
  const resumeName = req.file?.originalname || "resume.pdf";

  if (!filePath) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Step 1: Extract text
    const extractedText = await extractPdfText(filePath);
    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(422).json({ error: "Text extraction failed or resume too short" });
    }

    // Step 2: Start Cloudinary upload in parallel
    const uploadPromise = uploadToCloudinary(filePath);

    // Step 3: AI analysis
    const aiAnalysisPromise = analyzeWithOpenRouter(extractedText);

    // Step 4: Extract project bullet points for rewrite
    const lines = extractedText.split("\n").map((l) => l.trim()).filter(Boolean);
    const projectStart = lines.findIndex((line) => /projects?/i.test(line));
    const projectEnd = lines.findIndex(
      (line, i) => i > projectStart && /^(skills?|education|experience|certifications?|awards?)/i.test(line)
    );
    const projectLines = lines.slice(projectStart + 1, projectEnd > -1 ? projectEnd : lines.length);

    const bulletPoints = projectLines.filter((line) => {
      const trimmed = line.trim();
      const looksLikeBullet = /^[\u2022\-•*]/.test(trimmed) || /^[A-Z].+\.$/.test(trimmed) || trimmed.length > 30;
      const skipPatterns = [
        /\b(india|panipat|haryana|email|phone|contact|linkedin|github|\d{10})\b/,
        /\bskills?\b/, /\bcss\b/, /\bhtml\b/, /\bjavascript\b/, /\breact\b/, /\bnode\b/
      ];
      return looksLikeBullet && !skipPatterns.some((p) => p.test(trimmed.toLowerCase()));
    });

    // Step 5: Batch rewrite bullet points in a single call if possible
    // Step 5: Rewrite bullet points individually
    const rewrites = bulletPoints.length
      ? await Promise.all(
        bulletPoints.map(async (bp) => {
          try {
            const rewritten = await rewriteAISuggestionWithOpenRouter(bp);
            // Avoid bad rewrites like single letters or empty strings
            if (!rewritten || rewritten.length < 10) {
              return bp;
            }
            return rewritten;
          } catch (e) {
            console.error(`⚠️ Rewrite failed for: "${bp}"`, e.message);
            return bp;
          }
        })
      )
      : [];


    // Step 6: Wait for AI analysis & upload to finish
    const aiReportRaw = await aiAnalysisPromise;
    const resumeUrl = await uploadPromise;

    // Step 7: Filter buzzwords
    const atsKeywords = ["summary", "experience", "project", "skill", "education", "certification", "award", "honor"];
    const buzzwords = (aiReportRaw.buzzwords || [])
      .filter((w, i) => i < 15 && !atsKeywords.some((k) => w.toLowerCase().includes(k)))
      .slice(0, 10);

    const aiReport = { ...aiReportRaw, buzzwords };
    const aiWarning = aiReportRaw.ai_warning || aiReportRaw.error || null;

    // Step 8: Save report
    const savedReport = await ResumeReport.create({
      user: req.user._id,
      fileUrl: resumeUrl,
      aiFeedback: JSON.stringify(aiReport),
      score: aiReport.ats_score || 0,
      resumeName,
      rewrites: bulletPoints.map((line, idx) => ({
        original: line,
        rewritten: rewrites[idx] || line
      })),
    });

    return res.status(200).json({
      message: aiWarning
        ? "Resume saved with limited AI analysis"
        : "Resume analyzed and saved successfully",
      resumeUrl,
      analysis: aiReport,
      rewrites: savedReport.rewrites,
      reportId: savedReport._id,
      createdAt: savedReport.createdAt,
      resumeName,
      warning: aiWarning,
    });
  } catch (err) {
    console.error("❌ Resume analysis failed:", err);
    return res.status(500).json({ error: "Resume analysis failed: " + err.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
};







// ✅ Get Resume History - GET /resume/history
export const getResumeReports = async (req, res) => {
  try {
    const reports = await ResumeReport.find({ user: req.user._id }).sort({ createdAt: -1 });

    const parsedReports = reports.map((report) => ({
      resumeUrl: report.fileUrl,
      resumeName: report.resumeName || "Resume.pdf", // ✅ Include name
      analysis:
        typeof report.aiFeedback === "string"
          ? JSON.parse(report.aiFeedback)
          : report.aiFeedback,
      reportId: report._id.toString(),
      createdAt: report.createdAt,
    }));

    return res.status(200).json({ reports: parsedReports });

  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch resume reports: " + err.message,
    });
  }
};



// ✅ Delete Report - DELETE /resume/:reportId
export const deleteResumeReport = async (req, res) => {
  const { reportId } = req.params;

  try {
    const deleted = await ResumeReport.findOneAndDelete({
      _id: reportId,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Report not found or unauthorized" });
    }

    return res.status(200).json({ message: "Resume report deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to delete resume report: " + err.message,
    });
  }
};


// ✅ Reanalyze Existing Resume - PUT /resume/reanalyze/:reportId
export const reanalyzeResume = async (req, res) => {
  const { reportId } = req.params;
  let tmpFile;

  try {
    const report = await ResumeReport.findOne({ _id: reportId, user: req.user._id });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // 🟡 Step 1: Download file from Cloudinary
    tmpFile = await tmp.file({ postfix: ".pdf" });
    const response = await axios.get(report.fileUrl, { responseType: "stream" });

    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(tmpFile.path);
      response.data.pipe(writeStream);
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // 🟢 Step 2: Extract and Reanalyze
    const extractedText = await extractPdfText(tmpFile.path);
    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(422).json({ error: "Text extraction failed or resume is too short" });
    }

    const aiReportRaw = await analyzeWithOpenRouter(extractedText);

    const atsKeywords = [
      "summary", "experience", "project", "skill", "education", "certification", "award", "honor"
    ];

    const buzzwords = (aiReportRaw.buzzwords || []).filter(
      (word, index) =>
        index < 15 && !atsKeywords.some((keyword) => word.toLowerCase().includes(keyword))
    ).slice(0, 10);

    const aiReport = {
      ...aiReportRaw,
      buzzwords
    };

    // 🟢 Step 3: Save updated report
    report.aiFeedback = JSON.stringify(aiReport);
    report.score = aiReport.ats_score || 0;
    report.createdAt = new Date();
    await report.save();

    return res.status(200).json({
      message: "Resume re-analyzed successfully",
      resumeUrl: report.fileUrl,
      resumeName: report.resumeName || "Resume.pdf", // ✅ Return name
      analysis: aiReport,
      reportId: report._id,
      createdAt: report.createdAt,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to re-analyze resume: " + err.message,
    });
  } finally {
    try {
      tmpFile?.cleanup?.();
    } catch { }
  }
};



























// ✅ GET /resume/:reportId
export const getResumeReportById = async (req, res) => {
  const { reportId } = req.params;

  try {
    const report = await ResumeReport.findOne({
      _id: reportId,
      user: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found or unauthorized" });
    }

    return res.status(200).json({
      resumeUrl: report.fileUrl,
      resumeName: report.resumeName,
      analysis:
        typeof report.aiFeedback === "string"
          ? JSON.parse(report.aiFeedback)
          : report.aiFeedback,
      score: report.score,
      createdAt: report.createdAt,
      reportId: report._id,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch report details: " + err.message,
    });
  }
};










// Utility: Sanitize plain text
function sanitizeText(text) {
  return String(text)
    .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII chars
    .replace(/\s+/g, " ") // Normalize spacing
    .trim();
}

// ✅ GET /api/resume/download/:reportId
export const downloadResumeReportPdf = async (req, res) => {
  const { reportId } = req.params;

  try {
    const report = await ResumeReport.findOne({ _id: reportId, user: req.user._id });
    if (!report) return res.status(404).json({ error: "Report not found" });

    const feedback =
      typeof report.aiFeedback === "string"
        ? JSON.parse(report.aiFeedback)
        : report.aiFeedback;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(report.resumeName || "resume-report").replace(/ /g, "_")}.pdf"`
    );

    doc.pipe(res);

    // --- Header
    doc.fontSize(22).font("Helvetica-Bold").text("AI Resume Analysis Report", {
      align: "center",
    });
    doc.moveDown(1.5);

    // --- Metadata
    doc.fontSize(12).font("Helvetica");
    doc.text(`Resume Name: ${sanitizeText(report.resumeName || "Unnamed Resume")}`);
    doc.text(`Uploaded: ${new Date(report.createdAt).toLocaleString()}`);
    doc.text(`ATS Score: ${report.score}%`);
    doc.moveDown();

    // --- Verdict Summary
    if (feedback.verdict_summary) {
      doc.fontSize(14).font("Helvetica-Bold").text("Verdict Summary");
      doc.fontSize(12).font("Helvetica").text(sanitizeText(feedback.verdict_summary)).moveDown();
    }

    // --- Section Definitions
    const sections = [
      { label: "Suggestions", key: "suggestions" },
      { label: "Buzzwords", key: "buzzwords" },
      { label: "Repeated Phrases", key: "repeated_phrases" },
      { label: "Missing Sections", key: "missing_sections" },
      { label: "Action Verbs", key: "action_verbs" },
      { label: "Tone Analysis", key: "tone_analysis" },
    ];

    sections.forEach(({ label, key }) => {
      const value = feedback[key];
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        doc.fontSize(14).font("Helvetica-Bold").text(label);
        doc.moveDown(0.5);

        if (Array.isArray(value)) {
          value.forEach((item, idx) =>
            doc.fontSize(12).font("Helvetica").text(`${idx + 1}. ${sanitizeText(item)}`)
          );
        } else {
          doc.fontSize(12).font("Helvetica").text(sanitizeText(value));
        }

        doc.moveDown();
      }
    });

    // --- Footer
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("Generated by Resume IQ – AI Resume Analyzer", {
        align: "center",
      })


    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};




export const rewriteAISuggestion = async (req, res) => {
  const { text } = req.body;
  const { reportId } = req.params;

  if (!text || text.trim().length < 5) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const rewritten = await rewriteAISuggestionWithOpenRouter(text);

    const report = await ResumeReport.findOne({ _id: reportId, user: req.user._id });
    if (!report) return res.status(404).json({ error: "Report not found" });

    report.rewrites = report.rewrites || [];
    report.rewrites.push({ original: text, rewritten });
    await report.save();

    return res.status(200).json({ rewritten });
  } catch (err) {
    console.error("Rewrite error:", err.message);
    return res.status(500).json({ error: "AI rewrite failed" });
  }
};










export const getReports = async (req, res) => {
  try {
    const reports = await ResumeReport.find({ })
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email avatar role"); // ✅ populate user details

    const parsedReports = reports.map((report) => ({
      reportId: report._id.toString(),
      resumeUrl: report.fileUrl,
      resumeName: report.resumeName || "Resume.pdf",
      analysis:
        typeof report.aiFeedback === "string"
          ? JSON.parse(report.aiFeedback)
          : report.aiFeedback,
      score: report.score,
      createdAt: report.createdAt,
      user: report.user, // ✅ include populated user object
    }));

    return res.status(200).json({
      success: true,
      reports: parsedReports,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch resume reports: " + err.message,
    });
  }
};








export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ResumeReport.findById(id)
      .populate("user", "firstName lastName email avatar role");

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    const parsedReport = {
      reportId: report._id.toString(),
      resumeUrl: report.fileUrl,
      resumeName: report.resumeName || "Resume.pdf",
      analysis:
        typeof report.aiFeedback === "string"
          ? JSON.parse(report.aiFeedback)
          : report.aiFeedback,
      score: report.score,
      createdAt: report.createdAt,
      rewrites: report.rewrites || [],
      user: report.user, // ✅ populated user
    };

    return res.status(200).json({
      success: true,
      report: parsedReport,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to fetch resume report: " + err.message,
    });
  }
};


export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await ResumeReport.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    await report.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Report deleted successfully",
      deletedReportId: id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Failed to delete report: " + err.message,
    });
  }
};


