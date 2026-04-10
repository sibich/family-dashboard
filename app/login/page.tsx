'use client'
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg("");
    const formData = new FormData(e.currentTarget);
    
    if (isLogin) {
      const res = await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirect: false,
      });
      if (res?.error) setMsg(res.error);
      else router.push('/');
    } else {
      const res = await registerUser(formData);
      setMsg(res.message);
      if (res.success) setIsLogin(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200 p-4">
      {/* Floating decorations */}
      <div className="fixed top-10 left-10 text-6xl animate-float opacity-30">🌟</div>
      <div className="fixed bottom-10 right-10 text-6xl animate-float opacity-30" style={{ animationDelay: '1s' }}>✨</div>
      <div className="fixed top-1/2 right-20 text-5xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🎨</div>
      
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl border-2 border-purple-200 animate-slide-in relative z-10">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-pulse-glow">🏠</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-2">
            {isLogin ? 'Welcome Back!' : 'Join the Family'}
          </h1>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">👤 Name</label>
              <input 
                name="name" 
                placeholder="Your awesome name" 
                required 
                className="w-full border-2 border-purple-200 p-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📧 Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="your@email.com" 
              required 
              className="w-full border-2 border-purple-200 p-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🔒 Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full border-2 border-purple-200 p-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all"
            />
          </div>
          
          <button className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white p-3 rounded-xl font-bold text-lg shadow-lg btn-hover">
            {isLogin ? '🚀 Sign In' : '✨ Sign Up'}
          </button>
        </form>

        {msg && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
            msg.includes('success') || msg.includes('created') 
              ? 'bg-green-100 text-green-700 border-2 border-green-300' 
              : 'bg-red-100 text-red-700 border-2 border-red-300'
          }`}>
            {msg}
          </div>
        )}

        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="w-full text-center mt-6 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          {isLogin ? '✨ Need an account? Register here!' : '👋 Have an account? Login here!'}
        </button>
      </div>
    </div>
  );
}
