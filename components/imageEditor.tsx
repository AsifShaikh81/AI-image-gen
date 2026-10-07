import { useGlobalstate } from '@/app/store/GlobalState'
import { ToolType } from '@/lib/constants'
import { point } from '@/types'
import NextImage from 'next/image'
import { createElement, useCallback, useEffect, useRef } from 'react'


export const ImageEditor = () => {
    const { image, selectedTool,brushSize,Mask,setMask } = useGlobalstate()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const startPosRef = useRef<point>(null)
    const maskCanvasRef = useRef<HTMLCanvasElement>(null)
    const ImageRef = useRef<HTMLImageElement>(null)
    const isDrawRef = useRef<boolean>(false)
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null)

    const draw = useCallback(() => {
        if (!canvasRef.current) return
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx || !ImageRef.current) return
        // clear the canvas
        ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
        // draw the image
        ctx?.drawImage(ImageRef.current, 0, 0)
        
        // copy mask to overlay
        ctx.save()
        if(!overlayCanvasRef.current || !maskCanvasRef.current) return
        const overlayCtx = overlayCanvasRef.current.getContext("2d") 
        overlayCtx?.clearRect(0,0,overlayCanvasRef.current?.width,overlayCanvasRef.current?.height)
        overlayCtx?.drawImage(maskCanvasRef.current,0,0)
       // change white to red on overlay
       const imageData =  overlayCtx?.getImageData(0,0,overlayCanvasRef.current.width,overlayCanvasRef.current.height)
       const data = imageData?.data
       const WHITE_THRESHOLD = 10
       for(let i = 0 ; i<data?.length; i+=4){
        // if white 
        if(data[i]>WHITE_THRESHOLD){
            data[i] = 255 //red
            data[i+1] = 0 // green
            data[i+2] = 0 // blue
            data[i+3] = 100 // alpha - controls opacity
        }else{
            // if black
            data[i+3] = 0 // full transparent
        }
       }
       overlayCtx?.putImageData(imageData,0,0)
       ctx.drawImage(overlayCanvasRef.current,0,0)
       ctx.restore()

    }, [image])

    // this use effect run when "image,draw " changes
    // on image load draw function will be called 
    useEffect(() => {
        if (!image) return
        const img = new Image()
        img.src = image
        img.onload = () => {
            // console.log("image loaded")

            ImageRef.current = img
            canvasRef.current!.width = img.naturalWidth
            canvasRef.current!.height = img.naturalHeight

            //prepare mask - this mask will not be shown to user 

            // maskCanvasRef.current = document.createElement('canvas')
            // if(!maskCanvasRef) return
            maskCanvasRef.current.width = img.width
            maskCanvasRef.current.height = img.height
            console.log("📏 Image natural size:", img.naturalWidth, "x", img.naturalHeight)

            const maskedctx = maskCanvasRef.current.getContext('2d')
            if (maskedctx) {
                maskedctx.fillStyle = 'black'
                maskedctx.fillRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height)
            }

            // create a temp(overlay) mask
            overlayCanvasRef.current = document.createElement('canvas')
            overlayCanvasRef.current.width = img.width
            overlayCanvasRef.current.height = img.height 

            draw()
        }


    }, [image, draw])
    const startDrawing = (e: React.PointerEvent) => {
        if (selectedTool === ToolType.pan) return
        if (e.pointerType !== "mouse") return
        isDrawRef.current = true

        e.preventDefault()

        console.log(e)

        const position = getPointerPos(e)
        // stored start position
        startPosRef.current = position

        console.log(position)

        
        if (selectedTool === ToolType.brush || selectedTool === ToolType.eraser) {
            updateMask(position, position)
        }
    }
    // drawing on the mask 
    const updateMask = (start: point, end: point) => {
            const ctx = maskCanvasRef.current?.getContext('2d')
            console.log("ctx exists:", !!ctx)
            if (!ctx) return
            ctx.lineWidth = brushSize
            ctx.lineCap = 'round'
            ctx.lineJoin = "round"

            // pehle color set karo
            if (selectedTool === ToolType.brush) {
                ctx.strokeStyle = 'white'
                ctx.fillStyle = 'white'
            } else if (selectedTool === ToolType.eraser) {
                ctx.strokeStyle = 'black'
                ctx.fillStyle = 'black'
            }
            console.log("strokeStyle after check:", ctx.strokeStyle, "| selectedTool was:", selectedTool)

            // phir draw karo
            ctx.beginPath()
            ctx.moveTo(start.x, start.y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()
        }
    // getting the position of pointer(location where mose/arrow is pointing)
    const getPointerPos = (e: React.PointerEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 }
        const rect = canvasRef.current?.getBoundingClientRect();
        const x = (e.clientX - rect?.left) * (canvasRef.current?.width / rect?.width)
        const y = (e.clientY - rect?.top) * (canvasRef.current?.height / rect?.height)
        return { x, y }
    }
    // when mouse move this func applies
    const drawMove = (e:React.PointerEvent) => {
        if(isDrawRef.current == false) return
        const startposi = startPosRef.current
        if(!startposi) return
        const currentposi =  getPointerPos(e)
        if(selectedTool === ToolType.brush || selectedTool ===  ToolType.eraser){
        updateMask(startposi,currentposi)
        startPosRef.current = currentposi
     }
      draw()
    }
    // when mouse no longe active on screen , mtlb mouse click kar k choodh diya 
    const stopDraw = ()=>{
        isDrawRef.current =  false
        if(maskCanvasRef.current){
        const dataUrl  =  maskCanvasRef.current?.toDataURL()
        console.log(dataUrl)
        setMask(dataUrl)
        }
    }
    return (
        <>
            <canvas ref={canvasRef}
                onPointerDown={startDrawing}
                onPointerMove={drawMove}
                onPointerUp={stopDraw}
                className="max-w-full max-h-full">
            </canvas>
            {/*    <NextImage
                src={image}
                alt="Uploaded Image"
                fill
                className="object-contain"
            /> */}
            <canvas ref={maskCanvasRef} className="max-w-full max-h-full">

            </canvas>
        </>
    )
}


/*• pointermove: Fires repeatedly whenever a pointer (mouse cursor, finger, or pen) changes its coordinates.
•pointerup: Fires when a pointer is no longer active (e.g., when a user releases a mouse button, 
                lifts their finger off a touchscreen, or removes a stylus from the screen). 
•pointerdown: this event fires when a pointing device—such as a mouse, pen/stylus, 
              or a finger on a touchscreen—becomes active by making physical contact or pressing a button
*/