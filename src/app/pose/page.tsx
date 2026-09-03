"use client";

import dynamic from "next/dynamic";

const PosePage = dynamic(() => import("@/app/screens/AI/PoseApp"), {
    ssr: false,
    loading : () => <div>Loading...</div>,
});

export default function Page() {
    return <PosePage />;
}