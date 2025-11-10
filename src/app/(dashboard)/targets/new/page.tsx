import { redirect } from 'next/navigation'
import { AuthService } from '@/lib/auth/auth-service'
import { TargetCreationClient } from './TargetCreationClient'
import Header from '@/components/Header'
import { prisma } from '@/lib/prisma'

export default async function NewTargetPage() {
  const currentUser = await AuthService.getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  if (!currentUser.managerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 w-full px-8 py-8">
          <div className="max-w-4xl">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Manager Assignment Required
              </h2>
              <p className="text-red-700">
                You must have a manager assigned to create performance targets.
                Please contact HR to assign a manager to your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fetch manager details
  const manager = await prisma.user.findUnique({
    where: { id: currentUser.managerId },
    select: {
      id: true,
      fullName: true,
      employeeId: true,
    }
  })

  const currentUserWithManager = {
    id: currentUser.id,
    email: currentUser.email,
    fullName: currentUser.fullName,
    employeeId: currentUser.employeeId,
    grade: currentUser.grade,
    department: currentUser.department,
    manager: manager ? {
      id: manager.id,
      fullName: manager.fullName,
      employeeId: manager.employeeId || '',
    } : null,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 w-full px-8 py-8">
        <div className="mx-auto">
          <TargetCreationClient currentUser={currentUserWithManager} />
        </div>
      </div>
    </div>
  )
}
