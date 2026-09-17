import { NextRequest, NextResponse } from 'next/server'
import { fal } from "@fal-ai/client";


export async function POST(req: NextRequest) {
  try {
    const { prompt, imageBase64, userFiles, aspectRatio } = await req.json()
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

    function getMimeType(dataUrl: string): string {
      const match = dataUrl.match(
        /^data:(image\/[a-zA-Z+]+);base64,/,
      );

      return match ? match[1] : "image/png";
    }

    function cleanBase64Image(dataUrl: string): string {
      return dataUrl.replace(/^data:(.*);base64,/, "");
    }

     //remix image 
     const imageUrls:string[] = [imageBase64]
    if (
      userFiles &&
      Array.isArray(userFiles) &&
      userFiles.length > 0
    ) {
      /**
        {
          filename: "saree-lady.jpg"
          mediaType: "image/jpeg"
          type: "file"
          url: "data:image/jpeg;base64,/9j/4AA..."
        }
      */
      const processedFiles = userFiles
      .filter((file:any)=>file.mediaType?.startsWith("image/"))
      .map((file:any)=>file.url)
      imageUrls.push(...processedFiles)

      
    }

    // gemini  model - nano banana 2 
    const result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
      input: {
        prompt: prompt,
        image_urls:imageUrls,
        resolution: '0.5K',
        aspect_ratio: aspectRatio,
        

      }

    })


   

    console.log("3 Nano Banana response received")
    console.log(result.data)

    const resultUrl = result.data.images[0].url
    console.log("4 Result URL:", resultUrl)

    return NextResponse.json({ result: resultUrl })
  } catch (error: any) {
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