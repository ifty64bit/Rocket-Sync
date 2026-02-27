import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function Checkbox({ checked, onChange, disabled }: CheckboxProps) {
  return (
    <div
      onClick={() => {
        if (!disabled) onChange();
      }}
      className={`relative inline-flex items-center justify-center w-6 h-6 mr-3 rounded-md border-2 transition-all duration-200 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${
        checked
          ? "bg-primary-500 border-primary-500"
          : "bg-transparent border-slate-600 hover:border-slate-400"
      }`}
    >
      {checked && <Check size={16} className="text-white absolute" />}
    </div>
  );
}

export default Checkbox;
