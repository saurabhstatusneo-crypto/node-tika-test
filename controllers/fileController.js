const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { extractStructuredData } = require("../services/aiService");

exports.extractContent = async (req, res) => {
  let filePath = null;

  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    filePath = file.path;
    const mimeType = file.mimetype;

    let extractedText = "";
    if (
      mimeType === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    }
    else if (
      mimeType.includes("wordprocessingml") ||
      file.originalname.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    }

    else {
      return res.status(400).json({
        message: "Unsupported file type",
      });
    }

    // ⚠️ Handle empty extraction
    if (!extractedText || extractedText.trim().length < 20) {
      return res.json({
        message: "Text extraction failed or too short",
        data: fallbackResponse(),
      });
    }

    // 🤖 Send to Groq
    const structuredData = await extractStructuredData(extractedText);

    // delete file
    fs.unlinkSync(filePath);

    return res.json({
      message: "Success",
      rawTextLength: extractedText.length,
      data: structuredData,
    });

  } catch (error) {
    console.error("Controller Error:", error);

    // cleanup file if exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(500).json({
      message: "Something went wrong",
      data: fallbackResponse(),
    });
  }
};

// fallback function
function fallbackResponse() {
  return {
    name: null,
    email: null,
    phone: null,
    skills: [],
    education: [],
    experience: [],
  };
}