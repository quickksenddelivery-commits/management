import { Zap } from 'lucide-react';

/**
 * Full-screen branded splash shown on first app load.
 * Animated mesh background + glowing logo + progress bar.
 */
export default function AppLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0D0D1A]">
      {/* Animated mesh background */}
      <div className="hero-bg-animate absolute inset-0" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#7C3AED]/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-[#A78BFA]/12 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[200px] rounded-full bg-[#F59E0B]/8 blur-[100px] pointer-events-none" />

      {/* Grid pattern */}
      <div className="grid-pattern absolute inset-0 opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Logo with pulsing glow */}
        <div className="relative mb-8 animate-fade-in-up">
          <div className="absolute -inset-6 rounded-3xl bg-[#7C3AED]/30 blur-2xl animate-glow-pulse" />
          <div className="relative w-20 h-20 bg-[#7C3AED] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.6)]">
            <Zap size={40} className="text-white fill-white" />
          </div>
        </div>

        {/* Wordmark */}
        <h1
          className="text-5xl sm:text-6xl font-black tracking-[0.25em] text-white mb-2 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          FANCONNECTPRO
        </h1>
        <p
          className="text-[#A78BFA] text-xs font-bold tracking-[0.3em] uppercase mb-12 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          Celebrity Events Platform
        </p>

        {/* Progress bar */}
        <div
          className="w-64 sm:w-80 animate-fade-in-up"
          style={{ animationDelay: '0.45s' }}
        >
          <div className="h-1 bg-[#1C1C3A] rounded-full overflow-hidden">
            <div className="loader-progress h-full bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#7C3AED] rounded-full" />
          </div>
          <p
            className="text-[#6060A0] text-xs mt-4 tracking-widest uppercase animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            Preparing your experience…
          </p>
        </div>
      </div>

      {/* Film grain overlay */}
      <div className="grain-overlay" />
    </div>
  );
}
