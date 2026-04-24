import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, X } from "lucide-react";
import { useTallyConnect } from "@/hooks/useTallyConnect";

const AuthPanel = () => {
  const { isAuthenticated, isConnecting, isConnected, church, rooms, selectedRoom, error, login, logout, selectRoom } =
    useTallyConnect();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      setShowLogin(false);
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        {church && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            {church.name}
          </span>
        )}
        {rooms.length > 0 && (
          <select
            value={selectedRoom || ""}
            onChange={(e) => selectRoom(e.target.value || null)}
            className="bg-black/80 border border-white/10 text-white/70 text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded focus:outline-none focus:border-red-500/50"
          >
            <option value="">Select room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: isConnected ? "#22c55e" : "#f59e0b" }}
          title={isConnected ? "Connected" : "Connecting…"}
        />
        <button
          onClick={logout}
          className="text-white/30 hover:text-white/70 transition-colors"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-1"
        title="Connect to TallyConnect relay"
      >
        <LogIn size={16} />
        <span className="text-[10px] font-mono uppercase tracking-wider">Connect</span>
      </button>

      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowLogin(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              className="bg-black border border-white/10 rounded p-6 w-full max-w-sm flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-white/80 text-sm font-mono uppercase tracking-widest">
                  TallyConnect Relay Login
                </h2>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="text-white/30 hover:text-white/70 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Email</span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/60 border border-white/10 text-white/90 px-3 py-2 rounded font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider">Password</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/60 border border-white/10 text-white/90 px-3 py-2 rounded font-mono text-sm focus:outline-none focus:border-red-500/50"
                />
              </label>
              {error && (
                <p className="text-red-400 text-xs font-mono">{error}</p>
              )}
              <button
                type="submit"
                disabled={isConnecting}
                className="bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 disabled:opacity-50 transition-colors px-4 py-2 rounded font-mono text-xs uppercase tracking-wider"
              >
                {isConnecting ? "Signing in…" : "Sign In"}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthPanel;
