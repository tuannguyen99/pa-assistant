import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth.config'
import Header from '@/components/Header'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const userRoles = session.user?.roles || []
  const isManager = userRoles.includes('manager') || userRoles.includes('hr_admin') || userRoles.includes('general_director') || userRoles.includes('board_manager')
  const isEmployee = userRoles.includes('employee') || userRoles.length === 0 // default to employee if no roles

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">Performance Assessment Dashboard</h1>
          <h2 className="text-xl font-semibold mb-4">Welcome, {session.user?.name || session.user?.email}</h2>
          <p className="text-gray-600 mb-6">
            Access your performance assessment tools and manage your targets below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isEmployee && (
              <Link href="/targets/new" className="block">
                <div className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <h3 className="font-semibold text-blue-800">Set My Targets</h3>
                  <p className="text-blue-600 text-sm">Create and manage your performance targets</p>
                </div>
              </Link>
            )}

            {isManager && (
              <Link href="/targets/pending" className="block">
                <div className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <h3 className="font-semibold text-green-800">Review Targets</h3>
                  <p className="text-green-600 text-sm">Review and approve team member targets</p>
                </div>
              </Link>
            )}

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Analytics</h3>
              <p className="text-purple-600 text-sm">View performance analytics (coming soon)</p>
            </div>
          </div>

          {userRoles.includes('hr_admin') && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">HR Admin Tools</h3>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin" className="text-yellow-700 hover:text-yellow-900 underline text-sm">
                  Admin Panel
                </Link>
                <span className="text-yellow-600 text-sm">•</span>
                <Link href="/targets/pending" className="text-yellow-700 hover:text-yellow-900 underline text-sm">
                  All Pending Targets
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
