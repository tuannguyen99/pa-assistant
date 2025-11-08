import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/auth.config'
import Header from '@/components/Header'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">Performance Assessment Dashboard</h1>
          <h2 className="text-xl font-semibold mb-4">Welcome, {session.user?.email}</h2>
          <p className="text-gray-600 mb-6">
            This is your performance assessment dashboard. The full application features will be implemented in upcoming stories.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Target Setting</h3>
              <p className="text-blue-600 text-sm">Set performance targets for the year</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Reviews</h3>
              <p className="text-green-600 text-sm">Conduct performance reviews</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Analytics</h3>
              <p className="text-purple-600 text-sm">View performance analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
