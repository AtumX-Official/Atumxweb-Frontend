"use client";

import dynamic from "next/dynamic";

const BlocksPage = dynamic(() => import("@/app/screens/BlocksPage"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function Page() {
  return <BlocksPage />;
}