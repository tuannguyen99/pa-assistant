export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
          <p className="text-gray-600 mb-4">
            Welcome to the HR Admin dashboard. This page is only accessible to users with HR Admin role.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800 font-semibold">✅ Access Granted</p>
            <p className="text-green-700 text-sm">You have successfully accessed a role-protected admin page.</p>
          </div>
        </div>
      </div>
    </div>
  )
}