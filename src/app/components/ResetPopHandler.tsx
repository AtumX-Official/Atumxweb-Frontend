"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function ResetPopupHandler({
  onTrigger,
}: {
  onTrigger: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const showResetPopup = searchParams.get("showResetPopup");
    const showResetAlert = searchParams.get("showResetAlert");

    if (showResetPopup === "true" || showResetAlert === "true") {
      onTrigger();
      router.replace(pathname);
    }
  }, [searchParams, router, pathname, onTrigger]);

  return null;
}