import { Check } from "lucide-react";

interface CheckboxProps {
  value: {
    path: string;
    state: "pending" | "moving" | "transfared" | "failed";
    selected: boolean;
  };
  setFiles: React.Dispatch<React.SetStateAction<any[]>>;
}

function Checkbox({ value, setFiles }: CheckboxProps) {
  const toggleSelection = () => {
    setFiles((prevState) => {
      return prevState.map((f) => {
        if (f.path === value.path) {
          return { ...f, selected: !f.selected };
        }
        return f;
      });
    });
  };

  return (
    <div
      onClick={toggleSelection}
      className={`relative inline-flex items-center justify-center w-6 h-6 mr-3 cursor-pointer rounded-md border-2 transition-all duration-200 ${
        value.selected
          ? "bg-primary-500 border-primary-500"
          : "bg-transparent border-slate-600 hover:border-slate-400"
      }`}
    >
      {value.selected && <Check size={16} className="text-white absolute" />}
    </div>
  );
}

export default Checkbox;
