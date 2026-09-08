// /api/editImage/route.ts
// route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs';
import { InferenceClient } from "@huggingface/inference";
// import sharp from 'sharp'



export async function POST(req: NextRequest) {
  const client = new InferenceClient(process.env.HF_TOKEN);
  const { prompt, imageBase64 } = await req.json()

    if (!prompt || !imageBase64) {
      return NextResponse.json(
        { error: "prompt aur imageBase64 dono required hain" },
        { status: 400 }
      )
    }


  // for dynamic mimetype
  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  const mymimeType = match ? match[1] : 'image/jpeg';
  //"imageBase64" me "data:image/jpeg;base64," prefix hai, usko hata do
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

   // base64 -> Buffer -> Blob (actual uploaded image use ho rahi hai, hardcoded file nahi)
   //image ko blob me convert karne ke liye pehle base64 ko buffer me convert karna hoga 
   // image ko blob me isliye convert karna hoga kyunki huggingface inference client ko blob chahiye hota hai
    const buffer = Buffer.from(base64Data, 'base64')

    // buffer banane ke baad, is se replace karo:
// const processedBuffer = await sharp(buffer)
//   .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
//   .flatten({ background: '#ffffff' }) // alpha channel remove
//   .jpeg({ quality: 90 })
//   .toBuffer()
 
try {
 const Blobimage = await client.imageToImage({
	provider: "fal-ai",
	model: "black-forest-labs/FLUX.1-Kontext-dev",
	inputs: new Blob([buffer], { type: mymimeType }),
	parameters: { prompt},
});
/// Use the generated image (it's a Blob)
// For example, you can save it to a file or display it in an image element



// Blob ko base64 mein convert karo taaki JSON response mein bhej sakein
    const resultBuffer = Buffer.from(await Blobimage.arrayBuffer())
    const resultBase64 = `data:${Blobimage.type || 'image/png'};base64,${resultBuffer.toString('base64')}`
 
    return NextResponse.json({ result: resultBase64 })
} catch (error:any) {
    console.error("❌ imageToImage failed:", error?.message || error)
    console.error("Full error object:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: error?.message || "Image processing failed" },
      { status: 500 }
    )
}
}
