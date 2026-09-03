"use client"

import { useState, useRef } from "react";

export default function MainLayout() {
  const [classes, setClasses] = useState([1, 2]);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const addClass = () => {
    if (classes.length < 5) {
      setClasses([...classes, classes.length + 1]);
    }
  };

  const startCamera = async () => {
    setIsCameraOn(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  return (
<>
    <div>Main Layout page</div>
</>
  );
}