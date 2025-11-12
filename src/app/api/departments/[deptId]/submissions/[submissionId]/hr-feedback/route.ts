import { NextRequest, NextResponse } from 'next/server'

// POST /api/departments/{deptId}/submissions/{submissionId}/hr-feedback
export async function POST(request: NextRequest, { params }: { params: { deptId: string; submissionId: string } }) {
  const { deptId, submissionId } = params
  // TODO: Attach HR comments and optionally flag targets for update
  return NextResponse.json({ message: `HR feedback for dept ${deptId} submission ${submissionId} - stub` })
}
