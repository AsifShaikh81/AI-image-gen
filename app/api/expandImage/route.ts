import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {
            size,
            imageBase64,
        } = await req.json();

        if (!imageBase64) {
            return NextResponse.json(
                {
                    error: "No image provided",
                },
                {
                    status: 400,
                }
            );
        }

        if (!size) {
            return NextResponse.json(
                {
                    error: "Target ratio is required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!process.env.REWIND_API_KEY) {
            return NextResponse.json(
                {
                    error:
                        "REWIND_API_KEY is missing",
                },
                {
                    status: 500,
                }
            );
        }

        console.log(
            "Sending image to Rewind:",
            size
        );

        // --------------------------------
        // Convert data:image/...;base64 → Blob
        // --------------------------------

        const [header, base64] =
            imageBase64.split(",");
        //header = "data:image/png;base64"
        //base64= "iVBORw0KGgoAAAANSUhEUg..."

        if (!base64) {
            return NextResponse.json(
                {
                    error:
                        "Invalid base64 image format",
                },
                {
                    status: 400,
                }
            );
        }
        // converting data:image/png;base64 -> image/png
        const mimeType =
            header.match(
                /data:(.*);base64/
            )?.[1] || "image/png";

        // converting base64 to buffer
        const imageBuffer = Buffer.from(
            base64,
            "base64"
        );
        // converting buffer to blob
        const imageBlob = new Blob(
            [imageBuffer],
            {
                type: mimeType,
            }
        );

        const formData = new FormData();

        formData.append("file", imageBlob, "image.png");

        formData.append(
            "prompt",
            `Outpaint and expand this image beyond its current borders on all sides to a ${size} aspect ratio, generating new context-aware content, continuing the existing scene naturally.`
        );

        formData.append(
            "model",
            "black-forest-labs/flux.2-klein-4b"
        );

        formData.append("n", "1");


        formData.append("size", size);

        // --------------------------------
        // Call Rewind
        // --------------------------------

        const response = await fetch(
            "https://api.rewind.ai/v1/images/edits",
            {
                method: "POST",

                headers: {
                    Authorization: `Bearer ${process.env.REWIND_API_KEY}`,
                    // "Content-Type": "application/json",
                
                },

                body: formData
                // JSON.stringify({
                //     model: "black-forest-labs/flux.2-klein-4b",
                //     prompt: `Expand the image naturally to a ${aspectRatio} aspect ratio. Preserve the entire original image and extend the scene into the newly added areas.`,
                //     image: imageBlob,
                // })
            }
        );

        const data = await response.json();

        console.log(
            "Rewind response:",
            data
        );

        if (!response.ok) {
            throw new Error(
                data?.error?.message ||
                data?.error ||
                "Rewind AI expansion failed"
            );
        }

        // --------------------------------
        // Get generated image
        // --------------------------------

        const result =
            data?.data?.[0]?.url ||
            data?.data?.[0]?.b64_json ||
            data?.images?.[0]?.url ||
            data?.result;

        if (!result) {
            console.error(
                "Unexpected Rewind response:",
                data
            );

            throw new Error(
                "Rewind returned no image"
            );
        }

        // If Rewind returns base64 without data URI
        const resultImage =
            result.startsWith("data:")
                ? result
                : result.startsWith("http")
                    ? result
                    : `data:image/png;base64,${result}`;

        return NextResponse.json({
            result: resultImage,
        });
    } catch (error: any) {
        console.error(
            "AI Expansion error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error?.message ||
                    "AI image expansion failed",
            },
            {
                status: 500,
            }
        );
    }
}