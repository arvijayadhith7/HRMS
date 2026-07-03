import gsap from 'gsap';
import { AlertCircle, ArrowRight, Fingerprint, Lock, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Refs
  const sceneRef = useRef(null);
  const cardRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const fieldsRef = useRef(null);
  const btnRef = useRef(null);
  const successOverlayRef = useRef(null);
  const leftPanelRef = useRef(null);

  // Entry animation (clean professional)
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Initial states
    gsap.set(leftPanelRef.current, { opacity: 0, x: -40 });
    gsap.set(cardRef.current, { opacity: 0, y: 20 });
    gsap.set(titleRef.current, { opacity: 0, y: 15 });
    gsap.set(subtitleRef.current, { opacity: 0, y: 10 });
    gsap.set(fieldsRef.current, { opacity: 0, y: 15 });
    gsap.set(btnRef.current, { opacity: 0, y: 15 });

    // Sequence
    tl.to(leftPanelRef.current, { opacity: 1, x: 0, duration: 0.8 })
      .to(cardRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to(titleRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4')
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.3')
      .to(fieldsRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.25')
      .to(btnRef.current, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // SUCCESS: Smooth transition
      const tl = gsap.timeline();
      tl.to(cardRef.current, { scale: 0.98, opacity: 0, duration: 0.4 })
        .to(leftPanelRef.current, { opacity: 0, x: -20, duration: 0.4 }, '<')
        .to(successOverlayRef.current, { opacity: 1, duration: 0.4 }, '-=0.2');

      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or connection error');

      // Error: subtle shake
      gsap.to(cardRef.current, {
        x: -6, duration: 0.08, yoyo: true, repeat: 4, ease: 'power2.inOut',
        onComplete: () => gsap.to(cardRef.current, { x: 0, duration: 0.2 })
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={sceneRef}
      className="flex min-h-screen bg-gray-50 font-sans"
    >
      {/* Left Panel: Branding / Visual */}
      <div 
        ref={leftPanelRef}
        className="hidden lg:flex lg:w-1/2 relative bg-primary flex-col justify-between overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-primary/30"></div>
        </div>
        
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-lg">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">VirtualNest</h1>
          </div>
        </div>

        <div className="relative z-10 p-12 max-w-xl">
          <h2 className="text-4xl font-bold text-white mb-8 leading-tight">
            Enterprise HR Management <br/> Simplified.
          </h2>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-white font-bold text-2xl mb-1">99.9%</h3>
              <p className="text-gray-400 text-sm font-medium">Uptime SLA guarantee</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-white font-bold text-2xl mb-1">24/7</h3>
              <p className="text-gray-400 text-sm font-medium">Enterprise support</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-white font-bold text-2xl mb-1">ISO</h3>
              <p className="text-gray-400 text-sm font-medium">27001 Certified Security</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-white font-bold text-2xl mb-1">10k+</h3>
              <p className="text-gray-400 text-sm font-medium">Active employees managed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div ref={cardRef} className="w-full max-w-md">
          {/* Mobile Header (Visible only on small screens) */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">VirtualNest</h1>
          </div>

          <div ref={titleRef}>
            <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-2">Welcome back</h2>
          </div>
          <div ref={subtitleRef}>
            <p className="text-secondary mb-8">Please enter your credentials to access your account.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-3 text-danger font-semibold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} ref={fieldsRef} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">Company Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-text-primary">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 pb-4">
              <input type="checkbox" id="remember" className="rounded border-border text-primary focus:ring-primary cursor-pointer w-4 h-4" />
              <label htmlFor="remember" className="text-sm text-secondary cursor-pointer">Remember me for 30 days</label>
            </div>

            <div ref={btnRef}>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3" />
                      <path d="M12 2a10 10 0 019.5 7" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success overlay */}
      <div
        ref={successOverlayRef}
        className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-white/90 backdrop-blur-sm"
        style={{ opacity: 0 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 rounded-full border-4 border-success border-t-transparent animate-spin"></div>
          </div>
          <p className="text-success font-bold text-xl tracking-wide">
            ACCESS GRANTED
          </p>
        </div>
      </div>
    </div>
  );
}
