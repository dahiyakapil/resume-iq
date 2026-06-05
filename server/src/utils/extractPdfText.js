import fs from "fs";
import path from "path";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { fromPath } from "pdf2pic";
import { createWorker } from "tesseract.js";

const TMP_PATH = path.join("tmp");
if (!fs.existsSync(TMP_PATH)) fs.mkdirSync(TMP_PATH);

export const extractPdfText = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found: ${filePath}`);
    }

    // pdf-parse first
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    if (data.text && data.text.trim().length > 30) {
      return data.text.trim();
    }

    console.warn("⚠ pdf-parse result too short — falling back to OCR...");

    // OCR fallback using pdf2pic + tesseract.js
    const convert = fromPath(filePath, {
      density: 300,
      saveFilename: "resume-page",
      savePath: TMP_PATH,
      format: "png",
      width: 2000,
      height: 2800,
    });

    const worker = await createWorker("eng");
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    let pageNum = 1;
    let fullText = "";
    while (true) {
      try {
        const page = await convert(pageNum);
        if (!page?.path || !fs.existsSync(page.path)) break;

        const {
          data: { text },
        } = await worker.recognize(page.path);
        fullText += "\n" + text.trim();
        fs.unlinkSync(page.path);

        pageNum++;
      } catch {
        break;
      }
    }

    await worker.terminate();
    return fullText.trim();

  } catch (error) {
    throw new Error("Text extraction failed: " + error.message);
  }
};
