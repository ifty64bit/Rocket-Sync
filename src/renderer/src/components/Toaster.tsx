import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          border: "1px solid #334155",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
          borderRadius: "0.75rem",
          padding: "16px",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
