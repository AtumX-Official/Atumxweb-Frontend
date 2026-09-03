import { MoreVertical, X } from "lucide-react";
import { useEffect, useState } from "react";

interface UploadControlsProps {
  isCameraOn?: boolean
}

export default function UploadControls({ isCameraOn }: UploadControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  const [fps, setFps] = useState(24);
  const [duration, setDuration] = useState(24);
  const [holdToRecord, setHoldToRecord] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("cameraSettings");
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved) {
          if (typeof saved.fps === 'number') setFps(saved.fps);
          if (typeof saved.duration === 'number') setDuration(saved.duration);
          if (typeof saved.holdToRecord === 'boolean') setHoldToRecord(saved.holdToRecord);
        }
      } catch {
        /* ignore invalid JSON */
      }
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem(
      "cameraSettings",
      JSON.stringify({ fps, duration, holdToRecord })
    );
    setShowSettings(false);
  };

  const resetSettings = () => {
    setFps(24);
    setDuration(24);
    setHoldToRecord(true);
  };

  // ❗ Hide everything if camera is OFF
  if (!isCameraOn) return null;

  return (
    <div className="w-[300px] mt-3 flex flex-col items-start">
      
      {/* Buttons BELOW UploadCard */}
      <div className="flex gap-3">
        <button
          onClick={showSettings ? saveSettings : () => {}}
          className={`px-6 py-2 rounded font-medium ${
            showSettings ? "bg-green-500 text-white" : "bg-[#FFDE21]"
          }`}
        >
          {showSettings ? "Save" : "Start"}
        </button>

        <button onClick={() => setShowSettings(true)}>
          <MoreVertical />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 w-full bg-white p-4 rounded shadow-md">
          
          <div className="flex justify-between items-center">
            <p className="font-medium">More Settings</p>
            <X onClick={() => setShowSettings(false)} className="cursor-pointer" />
          </div>

          <div className="border-b border-black my-2" />

          {/* FPS */}
          <div className="flex justify-between items-center mt-2">
            <span>FPS</span>
            <input
              type="number"
              value={fps}
              onChange={(e) => setFps(Number(e.target.value) || 0)}
              className="bg-[#FFDE21] w-12 text-center"
            />
          </div>

          {/* Hold */}
          <div className="flex justify-between items-center mt-3">
            <span>Hold to record</span>
            <div
              onClick={() => setHoldToRecord(!holdToRecord)}
              className={`w-[60px] h-[24px] rounded flex items-center px-1 cursor-pointer ${
                holdToRecord ? "bg-green-400 justify-end" : "bg-gray-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 bg-black rounded" />
            </div>
          </div>

          {/* Duration */}
          <div className="flex justify-between items-center mt-3">
            <span>Number of samples</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 0)}
                className="bg-[#FFDE21] w-12 text-center"
              />
              <span>seconds</span>
            </div>
          </div>

          <button
            onClick={resetSettings}
            className="mt-4 w-full bg-black text-yellow-400 py-2 rounded"
          >
            Reset to Default
          </button>

        </div>
      )}
    </div>
  );
}