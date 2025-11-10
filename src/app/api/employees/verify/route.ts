import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const employeeId = searchParams.get("employeeId")

    if (!employeeId || employeeId.trim().length === 0) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        employeeId: employeeId.trim(),
      },
      select: {
        employeeId: true,
        fullName: true,
        grade: true,
        department: true,
        manager: {
          select: {
            fullName: true,
            employeeId: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: `Employee ID "${employeeId}" not found` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      employeeId: user.employeeId,
      fullName: user.fullName,
      grade: user.grade || "",
      department: user.department || "",
      manager: user.manager
        ? {
            fullName: user.manager.fullName,
            employeeId: user.manager.employeeId,
          }
        : null,
      status: "Active",
    })
  } catch (error) {
    console.error("Error verifying employee:", error)
    return NextResponse.json(
      { error: "Failed to verify employee ID" },
      { status: 500 }
    )
  }
}
