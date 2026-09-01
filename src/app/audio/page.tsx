"use client";

import dynamic from "next/dynamic";

const AudioPage = dynamic(() => import("@/app/screens/AI/AudioApp"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function page() {
  return <AudioPage />;
}
