"use client";

import dynamic from "next/dynamic";
import PageLoader from "@/app/components/PageLoader";

const AudioPage = dynamic(() => import("@/app/screens/AI/AudioApp"), {
  ssr: false,
  loading: () => <PageLoader label="Audio Classifier" accent="#36D3FF" />,
});

export default function page() {
  return <AudioPage />;
}
