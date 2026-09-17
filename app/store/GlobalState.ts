
  // store
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
      backgroundRemover:(imageBase64:string)=>Promise<void> // not functioning yet
      imageExpander:(aspectRatio:string, imageBase64:string)=>Promise<void>
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

      try {
        const response = await fetch('/api/geminieditImage',{
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          prompt:state.prompt,
          imageBase64:state.image,
          userFiles:state.userFiles,
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