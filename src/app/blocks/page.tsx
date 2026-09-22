"use client";

import dynamic from "next/dynamic";
import PageLoader from "@/app/components/PageLoader";

const BlocksPage = dynamic(() => import("@/app/screens/BlocksPage"), {
  ssr: false,
  loading: () => <PageLoader label="Blocks" accent="#2EED08" />,
});

export default function Page() {
  return <BlocksPage />;
}