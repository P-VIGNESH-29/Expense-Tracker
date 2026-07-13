import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="p-2 rounded-full hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer flex items-center justify-center border border-border-light/40 hover:border-border-hover/60 shadow-subtle shrink-0 animate-in fade-in zoom-in-95 duration-200"
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
}
