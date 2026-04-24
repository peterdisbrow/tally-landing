import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut } from "lucide-react";
import { useTallyConnect } from "@/hooks/useTallyConnect";
import LoginForm from "@/components/clock/LoginForm";

const AuthPanel = () => {
  const { isAuthenticated, isConnected, church, rooms, selectedRoom, logout, selectRoom } =
    useTallyConnect();
  const [showLogin, setShowLogin] = useState(false);

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
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
              <LoginForm
                onClose={() => setShowLogin(false)}
                onSuccess={() => setShowLogin(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthPanel;
