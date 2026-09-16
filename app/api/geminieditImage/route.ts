import { NextRequest, NextResponse } from 'next/server'
import { fal } from "@fal-ai/client";


export async function POST(req: NextRequest) {
    console.log("api hit")
   try{
    const { prompt, imageBase64, userFiles } = await req.json()
    console.log("1 Request received")
    console.log("Prompt:", prompt)
    console.log("Image exists:", !!imageBase64)
   if (!prompt || !imageBase64) {
      return NextResponse.json(
        { error: "prompt aur imageBase64 dono required hain" },
        { status: 400 }
      )
    }
         
      console.log("2 Calling Nano Banana 2...")

    // gemini  model - nano banana 2 
    const result =  await fal.subscribe("fal-ai/nano-banana-2/edit", {
        input:{
            prompt:prompt,
            image_urls:[imageBase64]

        }
    })


//Idea Drop - remix image 
// if(userFiles && userFiles.length > 0){
//   const userFilesBlobs = userFiles.map((file: any) => {
//     const fileBuffer = Buffer.from(file.url, 'base64');
//     return new Blob([fileBuffer], { type: file.mimeType });
//   });
//   console.log("✅ userFilesBlobs:", userFilesBlobs);
//   
// }
// console.log("✅ imageToImage successful:", Blobimage)
/// Use the generated image (it's a Blob)
// For example, you can save it to a file or display it in an image element
 console.log("3 Nano Banana response received")
 console.log(result.data)

const resultUrl = result.data.images[0].url
 console.log("4 Result URL:", resultUrl)
 
    return NextResponse.json({ result: resultUrl })
} catch (error:any) {
    console.error("❌ imageToImage failed:", error?.message || error)
    console.error("Full error object:", JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: error?.message || "Image processing failed" },
      { status: 500 }
    )
}
}

// FLOW 
/* Frontend image(Base64)
      ↓
fal Nano Banana 2
      ↓
result.data.images[0].url
      ↓
Frontend */