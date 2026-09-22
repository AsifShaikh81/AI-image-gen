import { useGlobalstate } from '@/app/store/GlobalState'
import NextImage from 'next/image'
import { useCallback, useEffect, useRef } from 'react'


export const ImageEditor = () => {
    const { image } = useGlobalstate()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    
const draw = useCallback(()=>{
    if(!canvasRef.current) return 
    if(!image) return
   const ctx = canvasRef.current.getContext("2d");
    const img =  new Image()
    img.src = image

    img.onload = ()=>{
        canvasRef.current!.width = img.naturalWidth
        canvasRef.current!.height = img.naturalHeight
      // clear the canvas
      ctx?.clearRect(0,0,canvasRef.current!.width, canvasRef.current!.height)
      // draw the image
      ctx?.drawImage(img,0,0)
    }

   },[image])

    // this use effect run when "image,draw " changes
    // on image load draw function will be called 
    useEffect(() => {
        if (!image) return
        const img = new Image()
        img.src = image
        img.onload = () => {
            console.log("image loaded")
            draw()
        }


    }, [image,draw])
    return (
        <>

            <canvas ref={canvasRef}
            className="max-w-full max-h-full"
            >

            </canvas>
            <NextImage
                src={image}
                alt="Uploaded Image"
                fill
                className="object-contain"
            />

        </>
    )
}
