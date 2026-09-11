
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
      //Idea Drop - remix image 
      // userFiles:FileUIPart[]
      // setUserFiles:(files:FileUIPart[])=>void
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
    //Idea Drop - remix image 
    // userFiles:[],
    // setUserFiles:(files:FileUIPart[])=>{
    //   set({userFiles:files})
    // },
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
        const response = await fetch('/api/editImage',{
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
      
      

    }

  })))