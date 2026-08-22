// /api/editImage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai";
import fs from 'node:fs';


export async function POST(req: NextRequest) {
  const { prompt, imageBase64 } = await req.json()

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  // for dynamic mimetype
  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  const mymimeType = match ? match[1] : 'image/jpeg';
  //"imageBase64" me "data:image/jpeg;base64," prefix hai, usko hata do
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

  const parts = [
    { type: "text", text: prompt },
    {
      type: "image",
      mime_type: mymimeType, // dynamic mimetype based on the input image
      data: base64Data, // base64 encoded image data without the prefix
    },
  ];
  console.log("parts", parts)
  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-image",
    input: parts
  });

  const generatedImage = interaction.output_image;
  if (generatedImage?.data) {
    const buffer = Buffer.from(generatedImage.data, "base64");
    fs.writeFileSync("gemini-native-image.png", buffer);
    console.log("Image saved as gemini-native-image.png");
  }




  return NextResponse.json({ result: `Image edited successfully` })
}