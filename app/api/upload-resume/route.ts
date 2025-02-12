import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import mammoth from "mammoth";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf";


pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
export const config = { api: { bodyParser: false } }; 

async function convertNextRequestToIncomingMessage(req: NextRequest): Promise<any> {
  const buffer = Buffer.from(await req.arrayBuffer()); 
  const stream = Readable.from([buffer]); 
  return Object.assign(stream, {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url,
  });
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return "";
  }
}

async function extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const data = new Uint8Array(fs.readFileSync(filePath));
      const loadingTask = pdfjs.getDocument({ data });
      const pdf = await loadingTask.promise;
      let text = "";
  
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        if (!content.items) {
          console.log(`Page ${i} has no text content.`);
          continue;
        }
  
        
        const extractedText = content.items
          .map((item: any) => (item.str ? item.str : ""))
          .join(" ");
  
        console.log(`Page ${i} Extracted Text:`, extractedText);
        text += extractedText + " ";
      }
  
      console.log("Final extracted text:", text.trim());
      return text.trim();
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      return "";
    }
  }
  
  

export async function POST(req: NextRequest) {
  try {
    const form = new IncomingForm({ uploadDir: path.join(process.cwd(), "public/uploads"), keepExtensions: true });
    const nodeReq = await convertNextRequestToIncomingMessage(req); 

    return new Promise((resolve, reject) => {
      form.parse(nodeReq, async (err, fields, files) => {
        if (err) {
          console.error("File parsing error:", err);
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

        
        fs.renameSync(file.filepath, newFilePath);

        
        let extractedText = "";
        if (file.mimetype === "application/pdf") {
          extractedText = await extractTextFromPDF(newFilePath);
        } else if (file.mimetype.includes("word")) {
          extractedText = await extractTextFromDOCX(newFilePath);
        }

        resolve(new NextResponse(JSON.stringify({
          message: "File uploaded and text extracted successfully!",
          filePath: `/uploads/${newFileName}`,
          extractedText,
        }), { status: 200 }));
      });
    });
  } catch (error) {
    console.error("Error uploading resume:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to upload resume", details: error.message }), { status: 500 });
  }
}
