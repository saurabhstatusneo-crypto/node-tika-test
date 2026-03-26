const groq = require("../config/groq");

exports.extractStructuredData = async (text) => {
  try {
    const prompt = `
You are an intelligent document parser.

Extract structured JSON from the following document.

Rules:
- Always return valid JSON
- Do not include extra text
- Handle resume, invoice, generic documents
- If field not found, return null

Expected JSON format:
{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "education": [],
  "experience": []
}

Document:
${text}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content || "{}";

    return safeJsonParse(content);
  } catch (err) {
    console.error("Groq Error:", err.message);
    return fallbackResponse();
  }
};
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn("Invalid JSON from AI, fixing...");
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        return fallbackResponse();
      }
    }

    return fallbackResponse();
  }
}
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