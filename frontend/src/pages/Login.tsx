import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Loader2, KeyRound, ArrowLeft 
} from "lucide-react";

// Types used for view switching
type ViewState = "login" | "forgot-email" | "reset-password";

const Login = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewState>("login");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const appName = import.meta.env.VITE_APP_NAME || "VGS Admin Portal";
  const API_URL = "http://localhost:5000/api/auth"; // Update with your actual backend URL

  // --- 1. HANDLE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("isAuthenticated", "true");
        toast.success("Welcome back, Administrator!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. SEND OTP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("OTP sent to your email!");
        setView("reset-password");
      } else {
        toast.error(data.message || "User not found");
      }
    } catch (error) {
      toast.error("Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. RESET PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful! Please login.");
        setView("login");
        setPassword(""); 
        setNewPassword("");
        setOtp("");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("Error resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-50">
      
      {/* LEFT SIDE - BRANDING (Same as before) */}
      <div className="relative hidden w-1/2 lg:flex flex-col justify-between p-12 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop" 
            alt="Office" 
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/80 mix-blend-multiply" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white/90">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
              <ShieldCheck className="h-6 w-6 text-indigo-300" />
            </div>
            <span className="text-lg font-bold tracking-wide uppercase">Admin Secure</span>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <motion.h1 
            className="text-5xl font-extrabold text-white leading-tight mb-6"
          >
            Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">Recruitment</span> Ecosystem.
          </motion.h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            Streamline hiring, manage candidates, and oversee operations from one central command center.
          </p>
        </div>
        <div className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE - DYNAMIC FORMS */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white p-8 md:p-12">
        <AnimatePresence mode="wait">
          
          {/* --- VIEW 1: LOGIN --- */}
          {view === "login" && (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 mb-4">
                  <Lock className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
                <p className="text-slate-500">Enter your credentials to access the portal.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <button type="button" onClick={() => setView("forgot-email")} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
                        placeholder="••••••••"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                </button>
              </form>
            </motion.div>
          )}

          {/* --- VIEW 2: FORGOT PASSWORD (EMAIL) --- */}
          {view === "forgot-email" && (
            <motion.div 
              key="forgot-email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md space-y-8"
            >
               <button onClick={() => setView("login")} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 mb-4">
                 <ArrowLeft size={16} /> Back to Login
               </button>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                  <KeyRound className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reset Password</h2>
                <p className="text-slate-500">Enter your email to receive a verification code.</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
                </button>
              </form>
            </motion.div>
          )}

          {/* --- VIEW 3: VERIFY OTP & RESET --- */}
          {view === "reset-password" && (
            <motion.div 
              key="reset-password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Secure Reset</h2>
                <p className="text-slate-500">Enter the 6-digit code sent to {email}</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">One-Time Password (OTP)</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="flex h-12 w-full text-center tracking-widest text-xl font-mono rounded-xl border border-slate-200 bg-white py-3 focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
                      placeholder="000000"
                      required
                    />
                  </div>
                  
                  {/* New Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm focus-visible:ring-2 focus-visible:ring-indigo-600 outline-none"
                        placeholder="New strong password"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Change Password"}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;