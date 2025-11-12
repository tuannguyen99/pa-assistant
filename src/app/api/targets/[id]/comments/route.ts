import { NextRequest, NextResponse } from 'next/server'

// GET /api/targets/[id]/comments
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  // TODO: Return threaded comments for target set
  return NextResponse.json({ comments: [], message: `Comments for target ${id} - stub` })
}
