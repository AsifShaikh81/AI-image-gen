
  // store
  import { ToolType } from '@/lib/constants'
import { FileUIPart } from 'ai'
import { create } from 'zustand'
  import { devtools } from 'zustand/middleware'

  type imgTP ={
      image:string | null
      setImage:(imageData:string) => void
      prompt:string
      setprompt:(prompt:string) => void
      // send prompt and image to server
      spaits:()=> Promise<void>
      history:string[]
      setHistory:(history:string[])=>void
      historyIndex:number
      setHistoryIndex:(index:number)=>void
      undo:()=>void
      redo:()=>void
      showHistory:boolean
      toggleShowHistory:()=>void
      isLoading:boolean
      userFiles:FileUIPart[]
      setUserFiles:(files:FileUIPart[])=>void
      applyFilters:(promt:string)=>Promise<void>
      backgroundRemover:(imageBase64:string)=>Promise<void> // not  using
      imageExpander:(aspectRatio:string, imageBase64:string)=>Promise<void> // not using
      selectedTool:ToolType
      setSelectedTool:(tool:ToolType)=>void
      brushSize: number
      setBrushSize:(size:number)=> void
      Mask:string | null
      setMask: (url:string)=>void
  }  

  export const useGlobalstate = create<imgTP>()(devtools((set,get) => ({
    image:null,
    history:[],
    historyIndex: 0,
    setHistoryIndex:(index:number)=>{
      const state = get()
      
      set({historyIndex:index,
        // image:get().history[index] || null
        image:state.history[index] || null
      })

    },
    setHistory:(history:string[])=> set(()=>({history})),
    setImage:(imageData) => set(()=>({image:imageData, history:[imageData]})),
    prompt:"",
    setprompt:(prompt:string)=> set(()=>({prompt})),
    undo:()=>{
      const state = get()
      if(state.historyIndex > 0){
        const newIndex =  state.historyIndex - 1
        set({historyIndex:newIndex,  image:state.history[newIndex]})
      }
    },  
    redo:()=>{
      const state = get()
      if(state.historyIndex < state.history.length - 1){
        const newIndex = state.historyIndex + 1 
        set({historyIndex:newIndex, image:state.history[newIndex]})
      }
    },
    showHistory:false,
    toggleShowHistory:()=> {
      const state= get()
      if(state.history.length){
        set({showHistory:!state.showHistory})
      }
    },
    isLoading:false,
    userFiles:[],
    setUserFiles:(files:FileUIPart[])=>{
      set({userFiles:files})
    },
    selectedTool:ToolType.pan,
    setSelectedTool: (tool:ToolType) =>{
      set({selectedTool:tool})
    },
     brushSize: 10,
      setBrushSize:(size:number)=>{
        set({brushSize:size})
      },
      Mask:null,
      setMask:(url)=>{
        set({Mask:url})
      },
      //send prompt and image to server
    spaits:async () => {
      const state = get()
     set(
      {
        isLoading:true
      }
     )
      // console.log("Sending prompt and image to server...")
      // console.log("prompt",state.prompt)
      // console.log("image",state.image)

    const finalPrompt = `
        TASK: Professional Image In-painting / Generative Fill.
        ROLE: Expert Photo Retoucher.

         INPUT DATA EXPLANATION:
         - You have received a primary image and a corresponding mask image.
         - The mask defines the precise editing region.
         - WHITE pixels in the mask indicate the area where you must apply the user's instruction.
         - BLACK pixels in the mask must remain exactly as they are in the original image.

         USER GOAL:
         "${state.prompt}"

         EXECUTION GUIDELINES (CRITICAL):
         1. IF REMOVING/ERASING: If the user asks to "remove", "erase", or "delete" an object, you MUST perform "Background Reconstruction". Analyze the surrounding background (wall, floor, nature) and seamlessly extend it over the masked area to hide the object.
         2. IF CHANGING/REPLACING: If the user asks to add or change something, generate the new object strictly within the white mask, matching the scene's lighting and perspective.
         3. SEAMLESS INTEGRATION: The new content generated inside the white masked area must perfectly match the surrounding environment's perspective, lighting direction, shadows, and color grading.
         4. TEXTURE MATCHING: Replicate the exact film grain, noise level, and sharpness of the original photo to prevent a "pasted-on" look. The transition at the mask boundary must be invisible.
         5. STRICT ISOLATION: Do not modify any pixels outside the designated white masked area under any circumstances`;

      try {
        const response = await fetch('/api/geminieditImage',{
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          prompt:finalPrompt,
          imageBase64:state.image,
          userFiles:state.userFiles,
          maskBase64:state.Mask 
        })

      }
      
     )
     if(!response.ok){
        set(
          {
            isLoading:false
          }
        )
      throw new Error("Failed to send prompt and image to server")

    }
     
    const data = await response.json()
    console.log("Response from server:",data)
    // here we get the result from the server and we need to update the state with the new image and history
    const cloneHistorty = [...state.history,data.result]

    if(data.result){
      set(()=>(
        {image:data.result, 
          history:cloneHistorty, 
          historyIndex:state.history.length,
          isLoading:false
        }))
    }
        
      } catch (error) {
        console.error("spaits error:", error)
      }
      
      

    },
    // For applying filters to the image
    applyFilters:async (prompt:string)=>{
      const state = get()
      const finalPrompt = `${prompt} 
      TECHNICAL CONSTRAINTS:
        1. STRICTLY PRESERVE COMPOSITION: Do not change the subject's pose, the camera angle, or the placement of objects.
        2. OUTPUT FORMAT: This is a style transfer. Keep the underlying structure of the image identical to the original, only changing the texture, lighting, and colors to match the requested style.
      `
     set(
      {
        isLoading:true
      }
     )
     
      try {
        const response = await fetch('/api/geminieditImage',{
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          prompt:finalPrompt,
          imageBase64:state.image,
          
        })

      }
      
     )
     if(!response.ok){
        set(
          {
            isLoading:false
          }
        )
      throw new Error("Failed to send prompt and image to server")

    }
     
    const data = await response.json()
    console.log("Response from server:",data)
    // here we get the result from the server and we need to update the state with the new image and history
    const cloneHistorty = [...state.history,data.result]

    if(data.result){
      set(()=>(
        {image:data.result, 
          history:cloneHistorty, 
          historyIndex:state.history.length,
          isLoading:false
        }))
    }
        
      } catch (error) {
        console.error("spaits error:", error)
      }

    },
   backgroundRemover:async(imageR:string)=>{
    const state = get()
    const finalPrompt = `Remove the background from the image, keeping only the main subject. The output should be a transparent PNG with the subject isolated.`
    set(
      {
        isLoading:true
      }
     )
    
     if(!imageR){
      console.error("No image found")
      return
     }
     try {
        const response = await fetch('/api/removeBackground',{
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          prompt:state.prompt,
          imageBase64:imageR,
          finalPrompt:finalPrompt
          
        })

      }
      
     )
     if(!response.ok){
        set(
          {
            isLoading:false
          }
        )
      throw new Error("Failed to send prompt and image to server")

    }
     
    const data = await response.json()
    console.log("Response from server:",data)
    
    const cloneHistorty = [...state.history,data.result]

    if(data.result){
      set(()=>(
        {image:data.result, 
          history:cloneHistorty, 
          historyIndex:state.history.length,
          isLoading:false
        }))
    }
        
      } catch (error) {
        console.error("spaits error:", error)
      }
     
     
   },
   imageExpander:async(aspectRatio:string, imageBase64:string)=>{
    const state = get()
    const baseInstruction = `High-fidelity outpainting. Analyze the visual context of the original image and seamlessly extend the scenery into the empty areas. Ensure the person's face and features remain completely unchanged`;

      const technicalConstraint = `Strictly maintain the continuity of existing lines, horizon, textures, lighting, and perspective. The transition must be invisible. Do not alter the style or content of the original center image `;

      const userContext = state.prompt
        ? `Addtional context/subject for extension: ${state.prompt}`
        : "";

      const finalPrompt = `
        ${baseInstruction}
        ${technicalConstraint}
        ${userContext}`;
    set(
      {
        isLoading:true
      }
     )
    
     if(!aspectRatio){
      console.error("No aspect ratio found")
      return
     }
     if(!imageBase64){
      console.error("No imageBase64 found")
      return
     }
     try {
        const response = await fetch('/api/geminieditImage',{
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          prompt:finalPrompt,
          imageBase64,
          aspectRatio
          
        })

      }
      
     )
     if(!response.ok){
        set(
          {
            isLoading:false
          }
        )
      throw new Error("Failed to send prompt and image to server")

    }
     
    const data = await response.json()
    console.log("Response from server:",data)
    
    const cloneHistorty = [...state.history,data.result]

    if(data.result){
      set(()=>(
        {image:data.result, 
          history:cloneHistorty, 
          historyIndex:state.history.length,
          isLoading:false
        }))
    }
        
      } catch (error) {
        console.error("spaits error:", error)
      }
     

   }

  })))