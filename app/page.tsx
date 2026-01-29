import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createPost, deletePost, toggleReaction } from "./actions";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">❄️ Sibichy Family 🏠 Dashboard 🏂️  ❄️</h1>
        <div className="flex gap-4 items-center">
          <span>Hello, {session.user.name}</span>
          {session.user.role === 'ADMIN' && (
            <Link href="/admin" className="text-blue-600 underline">Admin Panel</Link>
          )}
          <Link href="/api/auth/signout" className="text-red-500">Logout</Link>
        </div>
      </header>

      {/* Create Post Form */}
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow mb-8">
        <h2 className="text-lg font-semibold mb-2">New Post</h2>
        <form action={async (formData) => {
          'use server'
          await createPost(session.user.id, formData);
        }} className="space-y-3">
          <textarea name="content" placeholder="What's happening?" required className="w-full border p-2 rounded" />
          <div className="flex items-center gap-4">
            <input type="file" name="image" accept="image/*" className="text-sm" />
            <span className="text-xs text-gray-400">Max 100kB, 200x200px preferred</span>
          </div>
          <button className="bg-green-500 text-white px-4 py-2 rounded text-sm">Post</button>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="max-w-2xl mx-auto space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded shadow">
            <div className="flex justify-between mb-2">
              <span className="font-bold">{post.author.name}</span>
              <span className="text-xs text-gray-500">{post.createdAt.toLocaleDateString()}</span>
            </div>
            <p className="mb-4">{post.content}</p>

            {post.imageBase64 && (
              <img
                src={post.imageBase64}
                alt="Post attachment"
                className="mb-4 object-cover"
                style={{ width: '200px', height: '200px' }} // Fixed dimensions as requested
              />
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex gap-4">
                <form action={toggleReaction.bind(null, post.id, session.user.id, 'like')}>
                  <button className={`flex items-center gap-1 ${post.likedBy.includes(session.user.id) ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                    👍 {post.likedBy.length}
                  </button>
                </form>
                <form action={toggleReaction.bind(null, post.id, session.user.id, 'dislike')}>
                  <button className={`flex items-center gap-1 ${post.dislikedBy.includes(session.user.id) ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    👎 {post.dislikedBy.length}
                  </button>
                </form>
              </div>

              {/* Delete Button (Only for author) */}
              {post.authorId === session.user.id && (
                <form action={deletePost.bind(null, post.id)}>
                  <button className="text-red-500 text-sm">Delete</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}