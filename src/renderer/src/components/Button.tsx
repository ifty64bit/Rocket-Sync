import { ArrowLeft, RefreshCw, Send, Download } from "lucide-react";

interface ButtonProps {
  text?: string;
  onClick?: () => void;
  type?: "back" | "refresh" | "primary" | "secondary" | "send" | "receive";
  className?: string;
  disabled?: boolean;
}

function Button({
  text,
  onClick,
  type = "primary",
  className = "",
  disabled = false,
}: ButtonProps) {
  const baseClasses = `flex items-center justify-center gap-2 font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`;

  if (type === "back") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shadow-lg shadow-black/20 ${className}`}
        aria-label="Back"
      >
        <ArrowLeft size={24} />
      </button>
    );
  }

  if (type === "refresh") {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} p-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] ${className}`}
        aria-label="Refresh Device"
      >
        <RefreshCw size={24} className={disabled ? "" : "hover:animate-spin"} />
      </button>
    );
  }

  // Define styles for different button types
  const typeStyles = {
    primary:
      "bg-primary-600 hover:bg-primary-500 text-white shadow-[0px_4px_20px_rgba(34,197,94,0.3)] hover:shadow-[0px_6px_25px_rgba(34,197,94,0.4)]",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 shadow-lg",
    send: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0px_4px_20px_rgba(79,70,229,0.3)]",
    receive:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0px_4px_20px_rgba(16,185,129,0.3)]",
  };

  const iconMap = {
    primary: null,
    secondary: null,
    send: <Send size={18} />,
    receive: <Download size={18} />,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} px-6 py-3.5 rounded-xl ${typeStyles[type]} ${className}`}
    >
      {text}
      {iconMap[type]}
    </button>
  );
}

export default Button;
