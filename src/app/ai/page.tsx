"use client";

import dynamic from "next/dynamic";
import PageLoader from "@/app/components/PageLoader";

const AIApp = dynamic(() => import("@/app/screens/AI/App"), {
  ssr: false,
  loading: () => <PageLoader label="Hand Gesture" accent="#36D3FF" />,
});

export default function Page() {
  return <AIApp />;
}