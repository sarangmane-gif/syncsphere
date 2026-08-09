import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Login() {
  const { login, signup } = useAuth();
  const t = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setShowModal(false);
    setMode("login");
    setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      await login({ email: trimmedEmail, password: form.password });
      setShowModal(false);
      setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
    } catch (loginError) {
      setError(loginError?.response?.data?.error || t.invalidCredentials || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = form.fullName.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName || !trimmedEmail || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: trimmedName,
        email: trimmedEmail,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess("Account created. You can sign in now.");
      setMode("login");
      setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
    } catch (signupError) {
      setError(signupError?.response?.data?.error || "Unable to create account right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/auramemnon(1).jpg')",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="relative z-20 flex justify-end items-start p-6 min-h-screen pointer-events-none">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white text-sm font-bold uppercase tracking-widest shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] hover:shadow-[0_12px_40px_-10px_hsl(var(--primary)/0.8)] transition-all duration-300"
        >
          <LogIn className="h-4 w-4" strokeWidth={1.7} />
          {t.signIn || "Sign In"}
        </motion.button>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1] }}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="glass rounded-2xl p-8 border border-white/10 shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-light text-white mb-1">
                        {mode === "login" ? (t.welcomeBack || "Welcome back") : "Create account"}
                      </h2>
                      <p className="text-sm text-white/60">
                        {mode === "login"
                          ? (t.enterCredentials || "Enter your credentials to access the company workspace")
                          : "Set up your SyncSphere account to continue."}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="rounded-full p-2 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                      type="button"
                    >
                      <X className="h-5 w-5" strokeWidth={1.7} />
                    </button>
                  </div>

                  <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-5">
                    {mode === "signup" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                          Full name
                        </label>
                        <input
                          type="text"
                          value={form.fullName}
                          onChange={(e) => updateField("fullName", e.target.value)}
                          placeholder="Your full name"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[hsl(var(--primary)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                        {t.email || "Email"}
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder={t.emailPlaceholder || "team@novaterra.io"}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[hsl(var(--primary)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                        {t.password || "Password"}
                      </label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder={t.passwordPlaceholder || "••••••••"}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[hsl(var(--primary)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                      />
                    </div>

                    {mode === "signup" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                          Confirm password
                        </label>
                        <input
                          type="password"
                          value={form.confirmPassword}
                          onChange={(e) => updateField("confirmPassword", e.target.value)}
                          placeholder="Confirm password"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[hsl(var(--primary)/0.5)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                        />
                      </div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200"
                      >
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200"
                      >
                        {success}
                      </motion.div>
                    )}

                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      disabled={loading}
                      type="submit"
                      className="w-full rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)] hover:shadow-[0_12px_40px_-10px_hsl(var(--primary)/0.8)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (t.authenticating || "Authenticating…") : (mode === "login" ? (t.signIn || "Sign In") : "Create account")}
                    </motion.button>

                    <div className="flex items-center justify-center gap-2 pt-2 text-xs text-white/60">
                      <span>{mode === "login" ? "Need an account?" : "Already have an account?"}</span>
                      <button
                        type="button"
                        className="font-semibold text-white underline-offset-4 hover:underline"
                        onClick={() => {
                          setMode((current) => (current === "login" ? "signup" : "login"));
                          setError("");
                          setSuccess("");
                        }}
                      >
                        {mode === "login" ? "Sign up" : "Sign in"}
                      </button>
                    </div>

                    {mode === "login" && (
                      <p className="text-center text-xs text-white/50 pt-2">
                        {t.demoLoginHelp || "Use your email and password, or create a new account."}
                      </p>
                    )}
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="fixed bottom-8 left-8 z-20 pointer-events-none"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm">
            <LogIn className="h-5 w-5 text-white" strokeWidth={1.7} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-sm font-semibold tracking-[0.15em] text-white">
              SYNCSPHERE
            </h1>
            <p className="text-xs text-white/60 tracking-wider">Novaterra Industries</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
