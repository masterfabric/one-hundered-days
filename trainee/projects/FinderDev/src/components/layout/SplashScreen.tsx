"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Glitch karakterleri
const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?~`";

function GlitchText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const [isDecoding, setIsDecoding] = useState(true);

  useEffect(() => {
    let iteration = 0;
    const maxIterations = text.length * 2;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration / 2) {
              return char;
            }
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          })
          .join("")
      );

      iteration++;
      if (iteration >= maxIterations) {
        setDisplayText(text);
        setIsDecoding(false);
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <motion.span
      className={`${isDecoding ? "text-blue-300" : "text-blue-400"}`}
      animate={isDecoding ? { opacity: [1, 0.7, 1] } : {}}
      transition={{ duration: 0.1, repeat: isDecoding ? Infinity : 0 }}
    >
      {displayText}
    </motion.span>
  );
}

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden"
    >
      {/* Subtle Background Effects */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(15,23,42,0.6) 100%)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Sync with Header Logo */}
          <motion.div
            className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 relative overflow-hidden mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated Glow Inner */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
              animate={{
                opacity: [0.1, 0.4, 0.1],
                rotate: [0, 360]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />

            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
              <motion.path
                d="M7 7H17M7 12H14M7 7V17"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path
                d="M14 7C16.5 7 17 8.5 17 11C17 13.5 15.5 15 14 15V15"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>

          {/* Brand Name */}
          <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-wider mb-4">
            <GlitchText text="FinderDev" />
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-blue-400/50 font-mono text-sm tracking-widest"
          >
            {"<"} FIND_YOUR_DEV_MATCH {"/>"}
          </motion.p>

          {/* Loading Bar */}
          <motion.div
            className="mt-10 w-64 h-1 bg-slate-800 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
