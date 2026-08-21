"use client";

import dynamic from "next/dynamic";

const PythonPage = dynamic(() => import("@/app/screens/PythonPage"), {
  ssr: false,
});

export default function PythonRoute() {
  return <PythonPage />;
}
