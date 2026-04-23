import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { Building2, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export default function AuthGate() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-12 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-8 shadow-sm border border-gray-100 overflow-hidden p-2 relative">
            <img 
              src="https://logo.clearbit.com/hicomtecksee.com.my" 
              alt="Hicom-Teck See" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Building2 className="text-gray-200 absolute -z-10" size={32} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">HICOM-Teck See</h1>
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.2em] mb-4">Paint Monitoring System</p>
          <p className="text-gray-500 mb-10 leading-relaxed text-sm">
            Professional inventory management and automotive grade batch tracking.
          </p>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-sm"
          >
            <LogIn size={18} />
            Sign in with Google
          </button>
          
          <div className="mt-12 flex items-center gap-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            <span className="w-8 h-px bg-gray-200"></span>
            Precision Verified
            <span className="w-8 h-px bg-gray-200"></span>
          </div>
        </motion.div>
      </div>
      
      {/* Visual side for desktop */}
      <div className="hidden lg:block w-[40%] bg-white border-l border-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="black" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center">
           <div className="w-full max-w-sm space-y-6">
             <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl text-left">
                <div className="w-8 h-1 bg-indigo-500 rounded-full mb-4" />
                <p className="text-sm font-medium text-gray-600">"The easiest way to track paint shelf life across multiple sites."</p>
                <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">— Ops Manager</p>
             </div>
             <div className="text-left space-y-4">
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">Effortless Compliance.</h2>
                <p className="text-gray-500 text-sm leading-relaxed">Automated alerts and real-time logging ensure you never use an expired batch again. Built for scale, designed for simplicity.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
