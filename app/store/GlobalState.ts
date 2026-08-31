
  import { create } from 'zustand'
  import { devtools } from 'zustand/middleware'

  type imgTP ={
      image:string | null
      setImage:(imageData:string) => void
      prompt:string
      setprompt:(prompt:string) => void
      // send prompt and image to server
      spaits:()=> Promise<void>
  }

  export const useGlobalstate = create<imgTP>()(devtools((set,get) => ({
    image:null,
    setImage:(imageData) => set(()=>({image:imageData})),
    prompt:"",
    setprompt:(prompt:string)=> set(()=>({prompt})),
    
    spaits:async () => {
      const state = get()
    
      console.log("Sending prompt and image to server...")
      // console.log("prompt",state.prompt)
      // console.log("image",state.image)

      try {
        const response = await fetch('/api/editImage',{
        method:'POST',
        headers:{
          'content-type':'application/json'
        },
        body:JSON.stringify({
          prompt:state.prompt,
          imageBase64:state.image
        })

      }
      
    )
    if(!response.ok){
      throw new Error("Failed to send prompt and image to server")

    }

    const data = await response.json()
    console.log("Response from server:",data)

    if(data.result){
      set(()=>({image:data.result}))
    }
        
      } catch (error) {
        console.error("spaits error:", error)
      }
      
      

    }

  })))