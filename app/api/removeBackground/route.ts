import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(req: NextRequest) {
    // for dynamic mimetype
    const { imageBase64 } = await req.json();

  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  const mymimeType = match ? match[1] : 'image/jpeg';
  //"imageBase64" me "data:image/jpeg;base64," prefix hai, usko hata do
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  try {

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    
   console.log("FAL KEY EXISTS:", !!process.env.FAL_KEY); 
    // Background Remover model
   const result = await fal.subscribe("fal-ai/bria/background/remove", {
  input: {
    image_url: base64Data
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
// console.log(result.data);
// console.log(result.requestId);


    console.log("RMBG result:", result.data);

    const resultUrl = result.data.image.url;

    return NextResponse.json({
      result: resultUrl,
    });

  } catch (error: any) {
      console.error("RMBG error:", error);
  console.error("Status:", error?.status);
  console.error("Body:", error?.body);

    return NextResponse.json(
      {
        error: error?.message || "Background removal failed",
      },
      { status: 500 }
    );
  }
}