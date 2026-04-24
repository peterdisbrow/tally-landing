import { useState } from "react";
import { X } from "lucide-react";
import { useTallyConnect } from "@/hooks/useTallyConnect";

interface LoginFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
  title?: string;
}

const LoginForm = ({ onClose, onSuccess, title = "TallyConnect Relay Login" }: LoginFormProps) => {
  const { login, isConnecting, error } = useTallyConnect();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      setPassword("");
      onSuccess?.();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-black border border-white/10 rounded p-6 w-full max-w-sm flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-white/80 text-sm font-mono uppercase tracking-widest">{title}</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={18} />
          </button>
        )}
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
      {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
      <button
        type="submit"
        disabled={isConnecting}
        className="bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30 disabled:opacity-50 transition-colors px-4 py-2 rounded font-mono text-xs uppercase tracking-wider"
      >
        {isConnecting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
};

export default LoginForm;
