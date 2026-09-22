"use client";

import dynamic from "next/dynamic";
import PageLoader from "@/app/components/PageLoader";

const PosePage = dynamic(() => import("@/app/screens/AI/PoseApp"), {
    ssr: false,
    loading: () => <PageLoader label="Pose Detection" accent="#36D3FF" />,
});

export default function Page() {
    return <PosePage />;
}