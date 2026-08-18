// /api/editImage/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const {prompt,imageBase64}= await req.json()
    
  return NextResponse.json({ message: 'Image edited successfully' })
}