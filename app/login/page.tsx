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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && <input name="name" placeholder="Name" required className="w-full border p-2" />}
          <input name="email" type="email" placeholder="Email" required className="w-full border p-2" />
          <input name="password" type="password" placeholder="Password" required className="w-full border p-2" />
          <button className="w-full bg-blue-500 text-white p-2 rounded">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        {msg && <p className="text-red-500 mt-2">{msg}</p>}
        <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-500 mt-4 underline">
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
}