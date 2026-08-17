import { create } from 'zustand'

type imgTP ={
    image:string | null
    setImage:(imageData:string) => void
}

export const usegetImg = create<imgTP>((set) => ({
  image:null,
  setImage:(imageData) => set(()=>({image:imageData}))
}))