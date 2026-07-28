import { Rnd } from "react-rnd";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store";
import { getWebSocket } from "../../../../store/websocketSlice";
import Refreshicon from "../../assets/Refresh";
import AutoScroll from "../../assets/AutoScroll"
const SerialMonitor = ({
  onClose,
  iconRef,
}: {
  onClose: () => void;
  iconRef: any;
}) => {
  const rndRef = useRef<Rnd | null>(null);
  const [serialData, setSerialData] = useState("");
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const ws = getWebSocket();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(() => {
    const saved = localStorage.getItem("serial_autoscroll");
    return saved !== null ? JSON.parse(saved) : true;
  });
  useEffect(() => {
    localStorage.setItem("serial_autoscroll", JSON.stringify(autoScroll));
  }, [autoScroll]);
  const bgColor =
    themeMode === "dark" ? "bg-white text-black" : "bg-black text-white";

  useEffect(() => {
    if (!ws) return;
    ws.onmessage = (e) => {
      setSerialData((prev) => prev + e.data + "\n");
      console.log("Serial Data:", e.data);
    };
  }, [ws]);
  useEffect(() => {
    const handleSerialData = (data: string) => {
      console.log('Received data from serial:', data);
      setSerialData(prev => prev + data + '\n'); // append new line
    };
    window.api.serial.onData(handleSerialData);
  }, [])
  useEffect(() => {
    if (iconRef?.current && rndRef?.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const monitorWidth = 350;
      const monitorHeight = 250;

      let x = iconRect.left - monitorWidth - 20; // left of icon
      let y = iconRect.bottom + 10; // below icon

      if (x < 10) x = 10;
      if (y + monitorHeight > windowHeight) y = windowHeight - monitorHeight - 10;
      if (x + monitorWidth > windowWidth) x = windowWidth - monitorWidth - 10;

      rndRef.current.updatePosition({ x, y });
    }
  }, [iconRef]);
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [serialData, autoScroll]);

  const handleClearSerial = () => {
    setSerialData("");
  };

  const monitor = (
    <Rnd
      ref={rndRef}
      default={{
        x: 100,
        y: 100,
        width: 350,
        height: 250,
      }}
      minWidth={300}
      minHeight={150}
      dragHandleClassName="serial-header"
      className="fixed rounded-lg border border-gray-300 shadow-xl bg-white z-[999999] !important"
    >
      {/* Header */}
      <div
        className="serial-header flex justify-between items-center px-2 text-sm h-[30px]"
        style={{
          backgroundColor: "#F6EC24",
          cursor: "move",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <span className="font-bold">Serial Monitor</span>

        <div className="flex items-center gap-2">
          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(prev => !prev)}
            title={autoScroll ? "Autoscroll ON" : "Autoscroll OFF"}

          >
            <AutoScroll className={`w-5 h-5`} isSelected={autoScroll}
            />
          </button>

          {/* Refresh / Clear */}
          <button
            onClick={handleClearSerial}
            title="Clear all"
            className="hover:scale-110 transition"
          >
            <Refreshicon className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="text-red-600 font-bold text-lg"
            title="Close"
          >
            ✕
          </button>
        </div>

      </div>


      {/* Content */}
      <div
        ref={scrollRef}
        className={`p-2 ${bgColor} overflow-auto grow rounded-b-md h-full`}
      >
        <pre className="whitespace-pre-wrap">
          {serialData}
        </pre>
      </div>

    </Rnd>
  );

  return createPortal(monitor, document.body);
};

export default SerialMonitor;
