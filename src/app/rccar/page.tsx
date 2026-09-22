"use client";

import dynamic from "next/dynamic";
import PageLoader from "@/app/components/PageLoader";

const Rccar = dynamic(() => import("@/app/screens/Rccar"), {
  ssr: false,
  loading: () => <PageLoader label="Control Space" accent="#2EED08" />,
});

export default function Page() {
  return <Rccar />;
}
