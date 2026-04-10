import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { toggleUserStatus } from "../actions";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-50 to-pink-100 flex items-center justify-center p-8">
        <div className="glass rounded-3xl p-8 shadow-xl border-2 border-red-200 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don&apos;t have permission to view this page.</p>
          <Link href="/" className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg btn-hover inline-block">
            🏠 Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 animate-slide-in">
        <div className="glass rounded-3xl p-6 shadow-xl border-2 border-blue-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                ⚙️ User Management
              </h1>
              <p className="text-gray-600 text-sm mt-1">Manage family members and permissions</p>
            </div>
            <Link 
              href="/" 
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg btn-hover"
            >
              🏠 Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-6xl mx-auto animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <div className="glass rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white">
                  <th className="p-4 text-left font-bold">👤 Name</th>
                  <th className="p-4 text-left font-bold">📧 Email</th>
                  <th className="p-4 text-left font-bold">🎭 Role</th>
                  <th className="p-4 text-left font-bold">📊 Status</th>
                  <th className="p-4 text-left font-bold">⚡ Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="border-t-2 border-purple-100 hover:bg-purple-50 transition-colors"
                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                        user.role === 'ADMIN' 
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white' 
                          : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                      }`}>
                        {user.role === 'ADMIN' ? '👑 Admin' : '✏️ Editor'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                        user.isActive 
                          ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' 
                          : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                      }`}>
                        {user.isActive ? '✅ Active' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 flex-wrap">
                        <form action={async () => {
                          'use server'
                          await toggleUserStatus(user.id, !user.isActive, user.role);
                        }}>
                          <button className={`px-3 py-1 rounded-xl text-xs font-medium shadow-md btn-hover ${
                            user.isActive 
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}>
                            {user.isActive ? '⏸️ Disable' : '▶️ Enable'}
                          </button>
                        </form>
                        
                        <form action={async () => {
                          'use server'
                          const newRole = user.role === 'ADMIN' ? 'EDITOR' : 'ADMIN';
                          await toggleUserStatus(user.id, user.isActive, newRole);
                        }}>
                          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-xl text-xs font-medium shadow-md hover:bg-purple-200 btn-hover">
                            {user.role === 'ADMIN' ? '✏️ Make Editor' : '👑 Make Admin'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <div className="glass rounded-2xl p-6 shadow-xl border-2 border-green-200">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {users.length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Total Users</div>
        </div>
        
        <div className="glass rounded-2xl p-6 shadow-xl border-2 border-blue-200">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {users.filter(u => u.isActive).length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Active Users</div>
        </div>
        
        <div className="glass rounded-2xl p-6 shadow-xl border-2 border-purple-200">
          <div className="text-4xl mb-2">👑</div>
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {users.filter(u => u.role === 'ADMIN').length}
          </div>
          <div className="text-sm text-gray-600 font-medium">Admins</div>
        </div>
      </div>

      {/* Floating decoration */}
      <div className="fixed bottom-8 right-8 text-6xl animate-float pointer-events-none opacity-50">
        ⚙️
      </div>
    </div>
  );
}
