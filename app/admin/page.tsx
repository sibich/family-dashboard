import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { toggleUserStatus } from "../actions";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return <div className="p-8">Access Denied. <Link href="/" className="underline">Go Back</Link></div>;
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link href="/" className="bg-gray-200 px-4 py-2 rounded">Back to Dashboard</Link>
      </div>

      <table className="w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td className="p-3">{user.name}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3">{user.role}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {user.isActive ? 'Active' : 'Pending'}
                </span>
              </td>
              <td className="p-3 flex gap-2">
                <form action={async () => {
                  'use server'
                  await toggleUserStatus(user.id, !user.isActive, user.role);
                }}>
                  <button className="text-sm underline text-blue-600">
                    {user.isActive ? 'Disable' : 'Enable'}
                  </button>
                </form>
                
                {/* Simple Role Toggle for demo purposes */}
                <form action={async () => {
                  'use server'
                  const newRole = user.role === 'ADMIN' ? 'EDITOR' : 'ADMIN';
                  await toggleUserStatus(user.id, user.isActive, newRole);
                }}>
                  <button className="text-sm underline text-purple-600 ml-2">
                    Make {user.role === 'ADMIN' ? 'Editor' : 'Admin'}
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}