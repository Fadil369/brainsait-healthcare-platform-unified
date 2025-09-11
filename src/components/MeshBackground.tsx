"use client";

import React from "react";

type MeshBackgroundProps = {
  className?: string;
  speedPrimary?: number; // default 0.3
  speedWire?: number; // default 0.2
};

// Graceful fallback mesh gradient adhering to BrainSAIT brand colors.
export default function MeshBackground({ className = "", speedPrimary = 0.3, speedWire = 0.2 }: MeshBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: '#000' }}>
      {/* Primary mesh gradient blob */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(600px 600px at 20% 30%, #1a365d 0%, transparent 60%)," +
            "radial-gradient(500px 500px at 80% 20%, #2b6cb8 0%, transparent 60%)," +
            "radial-gradient(500px 500px at 30% 70%, #0ea5e9 0%, transparent 60%)," +
            "radial-gradient(450px 450px at 70% 80%, #ea580c 0%, transparent 60%)",
          animation: `meshMovePrimary ${10 / Math.max(speedPrimary, 0.05)}s ease-in-out infinite alternate`,
        }}
      />

      {/* Wireframe overlay */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 mix-blend-screen"
        style={{
          background:
            "radial-gradient(600px 600px at 10% 10%, rgba(255,255,255,0.2) 0%, transparent 60%)," +
            "radial-gradient(600px 600px at 90% 90%, rgba(255,255,255,0.15) 0%, transparent 60%)",
          animation: `meshMoveWire ${12 / Math.max(speedWire, 0.05)}s ease-in-out infinite alternate`,
        }}
      />

      <style jsx>{`
        @keyframes meshMovePrimary {
          0% { transform: translate3d(-2%, -2%, 0) scale(1); }
          100% { transform: translate3d(2%, 2%, 0) scale(1.05); }
        }
        @keyframes meshMoveWire {
          0% { transform: translate3d(2%, -2%, 0) scale(1); }
          100% { transform: translate3d(-2%, 2%, 0) scale(0.98); }
        }
      `}</style>
    </div>
  );
}

