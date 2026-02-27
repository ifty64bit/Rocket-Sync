import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Smartphone,
  SmartphoneCharging,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/Button";

function Home() {
  const [phoneInfo, setPhoneInfo] = useState<string>("Searching for device...");
  const [phoneStatus, setPhoneStatus] = useState<
    "pending" | "connected" | "offline" | "unauthorized"
  >("pending");
  const [isLoading, setIsLoading] = useState(true);

  const getPhoneInfo = async () => {
    setIsLoading(true);
    setPhoneInfo("Searching for device...");
    try {
      const resultRaw = await window.signal.getDevices(
        "shell getprop ro.product.bootimage.marketname",
      );

      const result = JSON.parse(resultRaw);

      let deviceName = "Connected Device";

      if (result.success && result.data.trim()) {
        deviceName = result.data.trim();
      } else if (result.success) {
        // Fallback to model if marketname is empty
        try {
          const fallbackRaw = await window.signal.getDevices(
            "shell getprop ro.product.model",
          );
          const fallbackResult = JSON.parse(fallbackRaw);
          if (fallbackResult.success && fallbackResult.data.trim()) {
            deviceName = fallbackResult.data.trim();
          }
        } catch (e) {
          // ignore fallback error
        }
      }

      if (result.success) {
        setPhoneStatus("connected");
        setPhoneInfo(deviceName);
        toast.success(`Connected to ${deviceName}`);
      } else {
        if (result.error === "UNAUTHORIZED") {
          setPhoneStatus("unauthorized");
          setPhoneInfo("Device Unauthorized");
          toast.error("Please accept the USB debugging prompt on your phone!", {
            duration: 5000,
          });
        } else if (result.error === "OFFLINE" || result.error === "TIMEOUT") {
          setPhoneStatus("offline");
          setPhoneInfo("Device offline or missing");
          toast.error("No device detected. Plug in your phone.", {
            duration: 3000,
          });
        } else {
          setPhoneStatus("offline");
          setPhoneInfo("Error connecting");
        }
      }
    } catch {
      setPhoneStatus("offline");
      setPhoneInfo("Error parsing ADB status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPhoneInfo();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-900/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/30 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 flex flex-col items-center w-full max-w-md p-10 mx-4 shadow-2xl glass rounded-3xl"
      >
        <div className="flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-linear-to-br from-primary-500 to-primary-700 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
          <SmartphoneCharging size={48} className="text-white" />
        </div>

        <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
          Rocket Sync
        </h1>
        <p className="mb-8 text-center text-slate-400">
          Lightning fast local file transfers
        </p>

        <div className="flex flex-col w-full gap-4 mb-8">
          <Link to="/computer2phone" className="w-full">
            <Button
              text="Send to Phone"
              type="send"
              className="w-full text-lg"
            />
          </Link>
          <Link to="/phone2computer" className="w-full">
            <Button
              text="Receive from Phone"
              type="receive"
              className="w-full text-lg"
            />
          </Link>
        </div>

        <div className="flex items-center justify-between w-full p-4 border rounded-2xl bg-slate-900/50 border-slate-700/50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                phoneStatus === "connected"
                  ? "bg-primary-500/20 text-primary-400"
                  : phoneStatus === "unauthorized"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-red-500/20 text-red-400"
              }`}
            >
              {isLoading || phoneStatus === "pending" ? (
                <Smartphone className="animate-pulse" size={24} />
              ) : phoneStatus === "unauthorized" ? (
                <AlertTriangle size={24} />
              ) : phoneStatus === "connected" ? (
                <Smartphone size={24} />
              ) : (
                <XCircle size={24} />
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {phoneStatus === "unauthorized"
                  ? "Permission Denied"
                  : "Device Status"}
              </span>
              <span
                className={`font-semibold ${phoneStatus === "unauthorized" ? "text-amber-300" : "text-slate-200"}`}
              >
                {phoneInfo}
              </span>
            </div>
          </div>
          <Button
            type="refresh"
            onClick={getPhoneInfo}
            disabled={isLoading}
            className="p-2! shadow-none!"
          />
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
