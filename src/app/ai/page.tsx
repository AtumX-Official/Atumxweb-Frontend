"use client";

import dynamic from "next/dynamic";

const AIApp = dynamic(() => import("@/app/screens/AI/App"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Page() {
  return <AIApp />;
}