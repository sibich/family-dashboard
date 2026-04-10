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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 md:p-6">
      {/* Header with gradient */}
      <header className="max-w-3xl mx-auto mb-8 glass rounded-3xl p-6 shadow-xl animate-slide-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            🌸 Sibichy Family 🏠 Board 🐝
          </h1>
          <div className="flex gap-3 items-center flex-wrap justify-center">
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-lg">
              👋 {session.user.name}
            </span>
            {session.user.role === 'ADMIN' && (
              <Link href="/admin" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-medium shadow-lg btn-hover">
                ⚙️ Admin
              </Link>
            )}
            <Link href="/api/auth/signout" className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-sm font-medium shadow-lg btn-hover">
              👋 Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Create Post Form - More colorful and fun */}
      <div className="max-w-3xl mx-auto mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <div className="glass rounded-3xl p-6 shadow-xl border-2 border-purple-200">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ✨ Share Something Cool!
          </h2>
          <form action={async (formData) => {
            'use server'
            await createPost(session.user.id, formData);
          }} className="space-y-4">
            <textarea 
              name="content" 
              placeholder="What's on your mind? 🤔💭" 
              required 
              className="w-full border-2 border-purple-200 p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all resize-none h-24 text-gray-800"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-xl cursor-pointer btn-hover shadow-lg">
                <span>📸 Add Image</span>
                <input type="file" name="image" accept="image/*" className="hidden" />
              </label>
              <span className="text-xs text-gray-500">Max 100kB, 200x200px preferred</span>
            </div>
            <button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg btn-hover">
              🚀 Post It!
            </button>
          </form>
        </div>
      </div>

      {/* Posts Feed - More vibrant cards */}
      <div className="max-w-3xl mx-auto space-y-6">
        {posts.map((post, index) => (
          <div 
            key={post.id} 
            className="glass rounded-3xl p-6 shadow-xl border-2 border-pink-200 hover:border-purple-300 transition-all animate-slide-in"
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            {/* Post Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  {post.author.name?.charAt(0) || '?'}
                </div>
                <div>
                  <span className="font-bold text-lg text-gray-800">{post.author.name}</span>
                  <p className="text-xs text-gray-500">{post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              {post.authorId === session.user.id && (
                <form action={deletePost.bind(null, post.id)}>
                  <button className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium hover:bg-red-200 transition-colors">
                    🗑️ Delete
                  </button>
                </form>
              )}
            </div>

            {/* Post Content */}
            <p className="mb-4 text-gray-700 text-lg leading-relaxed">{post.content}</p>

            {/* Post Image */}
            {post.imageBase64 && (
              <div className="mb-4 flex justify-center">
                <img
                  src={post.imageBase64}
                  alt="Post attachment"
                  className="rounded-2xl shadow-lg object-cover border-4 border-white"
                  style={{ width: '200px', height: '200px' }}
                />
              </div>
            )}

            {/* Reactions */}
            <div className="flex items-center gap-3 pt-4 border-t-2 border-purple-100">
              <form action={toggleReaction.bind(null, post.id, session.user.id, 'like')}>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all btn-hover ${
                  post.likedBy.includes(session.user.id) 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}>
                  👍 <span className="font-bold">{post.likedBy.length}</span>
                </button>
              </form>
              <form action={toggleReaction.bind(null, post.id, session.user.id, 'dislike')}>
                <button className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all btn-hover ${
                  post.dislikedBy.includes(session.user.id) 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}>
                  👎 <span className="font-bold">{post.dislikedBy.length}</span>
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* Fun floating decoration */}
      <div className="fixed bottom-8 right-8 text-6xl animate-float pointer-events-none opacity-50">
        🎨
      </div>
    </div>
  );
}
