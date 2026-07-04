'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
  type MotionValue,
} from 'framer-motion';
import { Lock, Mail, AlertCircle, ArrowRight, Fingerprint } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Floating shapes data ───
const shapesData = [
  { size: 10, left: '12%', top: '18%', color: 'rgba(99,102,241,0.3)', type: 'circle' },
  { size: 6, left: '82%', top: '22%', color: 'rgba(168,85,247,0.25)', type: 'circle' },
  { size: 8, left: '8%', top: '72%', color: 'rgba(59,130,246,0.2)', type: 'diamond' },
  { size: 12, left: '88%', top: '65%', color: 'rgba(139,92,246,0.2)', type: 'circle' },
  { size: 5, left: '25%', top: '82%', color: 'rgba(99,102,241,0.25)', type: 'circle' },
  { size: 7, left: '75%', top: '85%', color: 'rgba(168,85,247,0.2)', type: 'diamond' },
  { size: 4, left: '45%', top: '10%', color: 'rgba(59,130,246,0.3)', type: 'circle' },
  { size: 9, left: '65%', top: '12%', color: 'rgba(99,102,241,0.15)', type: 'circle' },
  { size: 6, left: '15%', top: '45%', color: 'rgba(168,85,247,0.2)', type: 'diamond' },
  { size: 5, left: '90%', top: '42%', color: 'rgba(59,130,246,0.25)', type: 'circle' },
];

// ─── Orbital ring sizes ───
const ringsSizes = [280, 340, 400];

// ─── FloatingShape component (avoids hooks-in-loop) ───
function FloatingShape({
  shape,
  index,
  smoothMouseX,
  smoothMouseY,
}: {
  shape: (typeof shapesData)[0];
  index: number;
  smoothMouseX: MotionValue<number>;
  smoothMouseY: MotionValue<number>;
}) {
  const parallaxX = useTransform(smoothMouseX, [-0.5, 0.5], [-(index + 1) * 12, (index + 1) * 12]);
  const parallaxY = useTransform(smoothMouseY, [-0.5, 0.5], [-(index + 1) * 12, (index + 1) * 12]);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: shape.left,
        top: shape.top,
        width: `${shape.size}px`,
        height: `${shape.size}px`,
        background: shape.color,
        borderRadius: shape.type === 'circle' ? '50%' : '2px',
        rotate: shape.type === 'diamond' ? '45deg' : '0deg',
        filter: 'blur(0.5px)',
        x: parallaxX,
        y: parallaxY,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        scale: { duration: 0.8, delay: 0.6 + index * 0.08, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: 0.8, delay: 0.6 + index * 0.08 },
      }}
    >
      {/* Gentle floating bob via a nested motion div */}
      <motion.div
        className="w-full h-full"
        animate={{
          y: [(index % 2 === 0 ? 1 : -1) * (8 + (index % 5) * 3), (index % 2 === 0 ? -1 : 1) * (8 + (index % 5) * 3)],
        }}
        transition={{
          y: {
            duration: 2.5 + (index % 4) * 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: index * 0.3,
          },
        }}
      />
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scanActive, setScanActive] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [orbFlashRed, setOrbFlashRed] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Mouse position for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Parallax transforms
  const orbX = useTransform(smoothMouseX, [-0.5, 0.5], [-40, 40]);
  const orbY = useTransform(smoothMouseY, [-0.5, 0.5], [-40, 40]);
  const cardX = useTransform(smoothMouseX, [-0.5, 0.5], [12, -12]);
  const cardY = useTransform(smoothMouseY, [-0.5, 0.5], [12, -12]);
  const cardRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-5, 5]);
  const cardRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [5, -5]);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const rect = sceneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setScanActive(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Login failed');
      }

      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Success animation
      setShowSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShakeCard(true);
      setOrbFlashRed(true);
      setTimeout(() => setShakeCard(false), 600);
      setTimeout(() => setOrbFlashRed(false), 800);
    } finally {
      setIsLoading(false);
      setTimeout(() => setScanActive(false), 900);
    }
  };

  // Fill credential helper
  const fillCredential = useCallback((email: string, password: string) => {
    form.setValue('email', email);
    form.setValue('password', password);
  }, [form]);

  // ─── Stagger animation variants ───
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.8,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div
      ref={sceneRef}
      className="relative flex items-center justify-center min-h-screen overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, #0F0A1E 0%, #070412 50%, #020106 100%)',
        fontFamily: "'Inter', sans-serif",
        perspective: '1200px',
      }}
    >
      {/* ─── Subtle grid background ─── */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ─── THE ORB ─── */}
      <motion.div
        className="absolute z-0"
        style={{
          width: '420px',
          height: '420px',
          x: orbX,
          y: orbY,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: showSuccess ? 20 : 1,
          opacity: showSuccess ? 0.8 : 1,
          rotate: 360,
        }}
        transition={
          showSuccess
            ? { scale: { duration: 1.2, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 1.2 } }
            : {
                scale: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 1.8, ease: [0.16, 1, 0.3, 1] },
                rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
              }
        }
      >
        {/* Orbital rings */}
        {ringsSizes.map((size, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${(420 - size) / 2}px`,
              top: `${(420 - size) / 2}px`,
              border: `1px solid rgba(99,102,241,${0.12 - i * 0.03})`,
              borderTopColor: `rgba(168,85,247,${0.25 - i * 0.05})`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{
              scale: { duration: 1.2, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 1.2, delay: 0.3 + i * 0.15 },
              rotate: { duration: 20 + i * 8, repeat: Infinity, ease: 'linear' },
            }}
          />
        ))}

        {/* Core orb with gradient morph */}
        <motion.div
          className="absolute"
          style={{
            width: '220px',
            height: '220px',
            left: '100px',
            top: '100px',
            backgroundSize: '200% 200%',
            filter: 'blur(1px)',
            boxShadow:
              '0 0 80px 20px rgba(99,102,241,0.25), 0 0 160px 60px rgba(139,92,246,0.12), inset 0 0 60px rgba(255,255,255,0.05)',
          }}
          animate={{
            borderRadius: [
              '50% 50% 50% 50%',
              '60% 40% 50% 50%',
              '50% 60% 40% 50%',
              '40% 50% 60% 50%',
              '50% 50% 50% 50%',
            ],
            background: orbFlashRed
              ? [
                  'linear-gradient(135deg, #EF4444 0%, #7F1D1D 50%, #DC2626 100%)',
                  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 25%, #A855F7 50%, #6366F1 75%, #3B82F6 100%)',
                ]
              : [
                  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 25%, #A855F7 50%, #6366F1 75%, #3B82F6 100%)',
                  'linear-gradient(135deg, #3B82F6 0%, #6366F1 25%, #8B5CF6 50%, #A855F7 75%, #6366F1 100%)',
                  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 25%, #A855F7 50%, #6366F1 75%, #3B82F6 100%)',
                ],
          }}
          transition={{
            borderRadius: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
            background: orbFlashRed
              ? { duration: 0.8, ease: 'easeOut' }
              : { duration: 8, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Inner bright core */}
        <div
          className="absolute rounded-full"
          style={{
            width: '80px',
            height: '80px',
            left: '170px',
            top: '170px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            filter: 'blur(6px)',
          }}
        />
      </motion.div>

      {/* ─── Floating shapes ─── */}
      {shapesData.map((s, i) => (
        <FloatingShape
          key={i}
          shape={s}
          index={i}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
        />
      ))}

      {/* ─── LOGIN CARD ─── */}
      <motion.div
        className="relative z-10 w-full max-w-[400px] mx-4"
        style={{
          transformStyle: 'preserve-3d',
          x: cardX,
          y: cardY,
          rotateY: cardRotateY,
          rotateX: cardRotateX,
        }}
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{
          opacity: showSuccess ? 0.5 : 1,
          y: 0,
          scale: showSuccess ? 0.95 : 1,
          x: shakeCard ? [0, -12, 12, -10, 10, -6, 6, 0] : 0,
        }}
        transition={{
          opacity: { duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] },
          y: { duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] },
          scale: { duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] },
          x: shakeCard ? { duration: 0.5, ease: 'easeOut' } : { duration: 0.3 },
        }}
      >
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(15,10,30,0.75) 0%, rgba(7,4,18,0.85) 100%)',
            backdropFilter: 'blur(40px) saturate(1.5)',
            border: '1px solid rgba(99,102,241,0.12)',
            boxShadow:
              '0 25px 80px -20px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Scan line (on submit) */}
          <AnimatePresence>
            {scanActive && (
              <motion.div
                className="absolute left-0 right-0 h-[2px] z-20 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.8), rgba(99,102,241,0.6), transparent)',
                  boxShadow: '0 0 15px 3px rgba(99,102,241,0.3)',
                }}
                initial={{ top: '0%', opacity: 1 }}
                animate={{ top: '100%', opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
              />
            )}
          </AnimatePresence>

          {/* Top gradient accent line */}
          <motion.div
            className="h-[2px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #6366F1 20%, #A855F7 50%, #6366F1 80%, transparent 100%)',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.div
            className="px-8 pt-10 pb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Brand */}
            <motion.div variants={childVariants} className="flex flex-col items-center mb-8">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                  border: '1px solid rgba(99,102,241,0.2)',
                  boxShadow: '0 0 30px rgba(99,102,241,0.15)',
                }}
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 0 45px rgba(99,102,241,0.3)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Fingerprint className="w-7 h-7" style={{ color: '#A78BFA' }} />
              </motion.div>
              <h1
                className="text-[22px] font-bold tracking-tight"
                style={{ color: '#E8E4F0' }}
              >
                VirtualNest
              </h1>
              <motion.p
                variants={childVariants}
                className="text-xs mt-1 font-medium tracking-[0.15em] uppercase"
                style={{ color: '#6B6580' }}
              >
                ENTERPRISE HRMS PORTAL
              </motion.p>
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-5 p-3.5 rounded-xl text-sm flex items-center gap-2.5 font-semibold"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    color: '#F87171',
                  }}
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-xs">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Fields */}
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <motion.div variants={childVariants} className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                    style={{ color: '#6B6580' }}
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none"
                      style={{ color: '#4C4162' }}
                    />
                    <input
                      {...form.register('email')}
                      type="email"
                      placeholder="name@company.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl outline-none text-sm font-medium transition-all duration-300 placeholder:text-[#2D2640]"
                      style={{
                        background: 'rgba(15,10,30,0.6)',
                        border: '1px solid rgba(99,102,241,0.1)',
                        color: '#D4D0E0',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(99,102,241,0.4)';
                        e.target.style.boxShadow =
                          '0 0 0 3px rgba(99,102,241,0.08), 0 0 20px rgba(99,102,241,0.06)';
                        const icon = e.target.previousElementSibling as HTMLElement;
                        if (icon) icon.style.color = '#818CF8';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(99,102,241,0.1)';
                        e.target.style.boxShadow = 'none';
                        const icon = e.target.previousElementSibling as HTMLElement;
                        if (icon) icon.style.color = '#4C4162';
                      }}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
                    style={{ color: '#6B6580' }}
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 pointer-events-none"
                      style={{ color: '#4C4162' }}
                    />
                    <input
                      {...form.register('password')}
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3 rounded-xl outline-none text-sm font-medium transition-all duration-300 placeholder:text-[#2D2640]"
                      style={{
                        background: 'rgba(15,10,30,0.6)',
                        border: '1px solid rgba(99,102,241,0.1)',
                        color: '#D4D0E0',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgba(99,102,241,0.4)';
                        e.target.style.boxShadow =
                          '0 0 0 3px rgba(99,102,241,0.08), 0 0 20px rgba(99,102,241,0.06)';
                        const icon = e.target.previousElementSibling as HTMLElement;
                        if (icon) icon.style.color = '#818CF8';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(99,102,241,0.1)';
                        e.target.style.boxShadow = 'none';
                        const icon = e.target.previousElementSibling as HTMLElement;
                        if (icon) icon.style.color = '#4C4162';
                      }}
                    />
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div variants={childVariants} className="mt-6">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 relative overflow-hidden group cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                    color: '#FFFFFF',
                    boxShadow:
                      '0 8px 30px -8px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
                  }}
                  whileHover={{
                    scale: 1.01,
                    boxShadow:
                      '0 12px 40px -6px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {/* Shimmer effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.12) 55%, transparent 60%)',
                      backgroundSize: '250% 100%',
                      animation: 'shimmer 2s infinite',
                    }}
                  />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            opacity="0.3"
                          />
                          <path
                            d="M12 2a10 10 0 019.5 7"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                          />
                        </svg>
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>

          {/* Bottom gradient accent */}
          <div
            className="h-[1px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 10%, rgba(99,102,241,0.08) 50%, transparent 90%)',
            }}
          />
        </div>

        {/* ─── Test credentials below card ─── */}
        <motion.div
          className="mt-5 px-2"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="rounded-2xl px-6 py-4"
            style={{
              background: 'rgba(15,10,30,0.4)',
              border: '1px solid rgba(99,102,241,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <p
              className="text-[9px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: '#4C4162' }}
            >
              Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <motion.div
                className="space-y-1 cursor-pointer rounded-lg p-1.5 -m-1.5 transition-colors"
                whileHover={{ backgroundColor: 'rgba(99,102,241,0.05)' }}
                onClick={() => fillCredential('admin@virtualnest.com', 'admin')}
              >
                <p className="font-bold" style={{ color: '#818CF8' }}>
                  Admin
                </p>
                <p style={{ color: '#6B6580' }}>
                  <span className="select-all font-medium" style={{ color: '#9B96A8' }}>
                    admin@virtualnest.com
                  </span>
                </p>
                <p style={{ color: '#6B6580' }}>
                  Pass:{' '}
                  <span className="select-all font-medium" style={{ color: '#9B96A8' }}>
                    admin
                  </span>
                </p>
              </motion.div>
              <div
                className="space-y-1 border-l pl-4"
                style={{ borderColor: 'rgba(99,102,241,0.08)' }}
              >
                <motion.div
                  className="space-y-1 cursor-pointer rounded-lg p-1.5 -m-1.5 transition-colors"
                  whileHover={{ backgroundColor: 'rgba(168,85,247,0.05)' }}
                  onClick={() => fillCredential('employee@virtualnest.com', 'employee')}
                >
                  <p className="font-bold" style={{ color: '#A78BFA' }}>
                    Employee
                  </p>
                  <p style={{ color: '#6B6580' }}>
                    <span className="select-all font-medium" style={{ color: '#9B96A8' }}>
                      employee@virtualnest.com
                    </span>
                  </p>
                  <p style={{ color: '#6B6580' }}>
                    Pass:{' '}
                    <span className="select-all font-medium" style={{ color: '#9B96A8' }}>
                      employee
                    </span>
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── Success overlay ─── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            style={{
              background:
                'radial-gradient(circle, rgba(99,102,241,0.3) 0%, rgba(7,4,18,0.95) 70%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.p
              className="text-white font-bold text-lg tracking-widest uppercase"
              style={{ textShadow: '0 0 30px rgba(99,102,241,0.8)' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              ACCESS GRANTED
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── CSS animations ─── */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
