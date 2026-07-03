'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  adminName: z.string().min(2, 'Admin name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { companyName: '', adminName: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3001/api/v1/auth/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-[#F8FAFC]">
      <div className="w-full max-w-md p-8 rounded-2xl bg-[#111827] border border-white/10 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#6366F1]">VirtualNest</h1>
          <p className="text-sm text-[#94A3B8] mt-2">Setup your company workspace</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              {...form.register('companyName')}
              className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
            />
            {form.formState.errors.companyName && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.companyName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Admin Full Name</label>
            <input
              {...form.register('adminName')}
              className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
            />
            {form.formState.errors.adminName && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.adminName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Work Email</label>
            <input
              {...form.register('email')}
              type="email"
              className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              {...form.register('password')}
              type="password"
              className="w-full px-3 py-2 bg-[#0B1120] border border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-[#6366F1] hover:bg-[#8B5CF6] text-white font-medium rounded-md transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)] disabled:opacity-50 mt-4"
          >
            {isLoading ? 'Creating workspace...' : 'Create Workspace'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#94A3B8]">
          Already have an account? <a href="/login" className="text-[#06B6D4] hover:underline">Sign In</a>
        </div>
      </div>
    </div>
  );
}
