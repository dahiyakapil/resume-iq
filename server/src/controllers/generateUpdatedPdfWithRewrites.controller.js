
import ResumeReport from "../models/ResumeReport.model.js";
import axios from "axios";

import { extractPdfText } from "../utils/extractPdfText.js";

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs/promises";
import Handlebars from "handlebars";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateUpdatedPdfWithRewrites = async (req, res) => {
  const { reportId } = req.params;
  const { appliedRewrites = {}, theme = "default", userData = {} } = req.body;

  try {
    // 1. Load the correct Handlebars template
    const templatePath = path.join(__dirname, "..", "templates", `${theme}.hbs`);
    const html = await fs.readFile(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(html);

    // 2. Merge user data + rewrites
    const templateData = {
      ...userData,
      appliedRewrites: Object.values(appliedRewrites),
    };

    // 3. Generate HTML from Handlebars
    const finalHtml = compiledTemplate(templateData);

    // 4. Launch Puppeteer and render PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // 5. Send PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="updated-resume-${reportId}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF Generation Error:", err);
    res.status(500).json({ error: "Failed to generate updated PDF" });
  }
};

// ✅ Helper to extract text again
async function extractPdfTextFromCloud(fileUrl) {
  const tmp = await import("tmp-promise");
  const tmpFile = await tmp.file({ postfix: ".pdf" });
  const response = await axios.get(fileUrl, { responseType: "stream" });

  await new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(tmpFile.path);
    response.data.pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  const text = await extractPdfText(tmpFile.path);
  tmpFile.cleanup();
  return text;
}