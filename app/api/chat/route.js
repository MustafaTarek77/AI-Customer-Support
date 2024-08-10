import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
import dotenv from "dotenv"; // Import dotenv to load environment variables

dotenv.config(); // Load environment variables from .env file

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = `You are an AI-powered customer support bot for HeadstartAI, a platform that facilitates AI-powered interviews for Software Engineering (SWE) jobs. Your primary objective is to assist users by providing clear, accurate, and helpful responses to their queries while maintaining a professional and supportive tone.`;

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// POST function to handle incoming requests
export async function POST(req) {
  const data = await req.json(); // Parse the JSON body of the incoming request
  const prompt = `${systemPrompt}\n${data.map(message => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`).join('\n')}`;
  try {
    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();
    console.log(text);

    
    return NextResponse.json({ text: text });
    //return new NextResponse(stream); // Return the stream as the response
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.error(); // Handle errors with a generic error response
  }
}
