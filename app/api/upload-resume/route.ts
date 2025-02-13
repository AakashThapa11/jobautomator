import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import { pathToFileURL } from "url";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const workerPath = path.join(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.mjs");
pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

export const config = { api: { bodyParser: false } };

// ✅ Fix: Add `convertNextRequestToIncomingMessage` function
async function convertNextRequestToIncomingMessage(req: NextRequest): Promise<any> {
  const buffer = Buffer.from(await req.arrayBuffer()); 
  const stream = Readable.from([buffer]); 
  return Object.assign(stream, {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url,
  });
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjs.getDocument({ data });
  const pdf = await loadingTask.promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const extractedText = content.items.map((item: any) => item.str).join(" ");
    text += extractedText + " ";
  }

  return text.trim();
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const { value } = await mammoth.extractRawText({ buffer });
  return value.trim();
}

async function extractProfileData(resumeText: string) {
  const prompt = `You are an AI that extracts structured data from resumes. Please analyze the following resume text and return a structured JSON.

  Resume text: """${resumeText}"""`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "system", content: prompt }],
    temperature: 0,
  });

  let gptResponse = response.choices[0].message.content.trim();

  // ✅ Remove Markdown formatting (` ```json ... ``` `) if present
  if (gptResponse.startsWith("```json")) {
    gptResponse = gptResponse.replace(/```json/, "").replace(/```/, "").trim();
  }

  console.log("GPT Response:", gptResponse);

  return JSON.parse(gptResponse);
}


export async function POST(req: NextRequest) {
  try {
    const form = new IncomingForm({ uploadDir: path.join(process.cwd(), "public/uploads"), keepExtensions: true });
    const nodeReq = await convertNextRequestToIncomingMessage(req); // ✅ Now this function is defined

    return new Promise((resolve, reject) => {
      form.parse(nodeReq, async (err, fields, files) => {
        if (err) {
          reject(new NextResponse(JSON.stringify({ error: "File parsing failed" }), { status: 500 }));
          return;
        }

        if (!files.resume || !Array.isArray(files.resume)) {
          resolve(new NextResponse(JSON.stringify({ error: "No file uploaded" }), { status: 400 }));
          return;
        }

        const file = files.resume[0];
        const uploadDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileExtension = path.extname(file.originalFilename || "");
        const sanitizedFileName = path.basename(file.originalFilename || "resume", fileExtension).replace(/[^a-zA-Z0-9-_]/g, "");
        const timestamp = Date.now();
        const newFileName = `${sanitizedFileName}-${timestamp}${fileExtension}`;
        const newFilePath = path.join(uploadDir, newFileName);
        const publicFilePath = `/uploads/${newFileName}`;

        fs.renameSync(file.filepath, newFilePath);

        let extractedText = "";
        if (file.mimetype === "application/pdf") {
          extractedText = await extractTextFromPDF(newFilePath);
        } else if (file.mimetype.includes("word")) {
          extractedText = await extractTextFromDOCX(newFilePath);
        }

        const extractedData = await extractProfileData(extractedText);

        resolve(new NextResponse(JSON.stringify({
          message: "File uploaded and text extracted successfully!",
          filePath: publicFilePath,
          extractedData,
        }), { status: 200 }));
      });
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to upload resume", details: error.message }), { status: 500 });
  }
}
