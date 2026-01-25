'use client'

import { Canvas } from "@/components/Canvas";
import { Suspense } from "react";

export default function Page() {
  return (
    <main className="min-h-screen w-full h-screen">
      <Suspense fallback={<div className="w-full h-full bg-white dark:bg-[#1A1A1A]" />}>
        <Canvas />
      </Suspense>
    </main>
  );
}