"use client";

import dynamic from "next/dynamic";

const CppPage = dynamic(() => import("@/app/screens/Cpp"), {
  ssr: false,
});

export default function CppRoute() {
  return <CppPage />;
}
