"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  NeonText,
  MorphingBlob,
  InteractiveParticles,
  Reveal,
  MagneticButton,
  Floating
} from "@/components/effects/PremiumEffects";
import { SmartSearch } from "@/components/home/SmartSearch";

// Animated code lines in background
function CodeLines() {
  const codeSnippets = [
    "const developer = await findDev();",
    "function buildTogether() { }",
    "import { success } from 'teamwork';",
    "<Developer skills={['React', 'Node']} />",
    "git push origin main",
    "npm run collaborate",
    "const match = findPerfectTeam();",
    "await project.launch();",
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {codeSnippets.map((code, i) => (
        <motion.div
          key={i}
          className="absolute font-mono text-sm text-blue-300 whitespace-nowrap"
          style={{
            left: `${5 + (i * 12) % 85}%`,
            top: `${10 + (i * 11) % 75}%`,
          }}
          initial={{ opacity: 0, x: -100 }}
          animate={{
            opacity: [0, 0.6, 0],
            x: [-100, 0, 100],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeInOut",
          }}
        >
          {code}
        </motion.div>
      ))}
    </div>
  );
}

// Typing effect component
function TypingText({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.04, duration: 0.2 }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        className="inline-block w-0.5 h-8 bg-blue-400 ml-1"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.span>
  );
}

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.section
      className="hero relative h-full min-h-screen flex flex-col items-center justify-center gap-2.5 overflow-hidden bg-slate-950"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Background Effects */}
      <div className="absolute inset-0">
        {/* Morphing Blobs */}
        <MorphingBlob className="w-[600px] h-[600px] bg-blue-500/10 -top-40 -left-40" />
        <MorphingBlob className="w-[500px] h-[500px] bg-cyan-500/5 -bottom-40 -right-40" />
        <MorphingBlob className="w-[400px] h-[400px] bg-purple-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        {/* Interactive Particles */}
        <InteractiveParticles count={40} />

        {/* Code Lines */}
        <CodeLines />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4"
        variants={containerVariants}
      >
        {/* Badge */}
        <Reveal delay={0}>
          <motion.div variants={itemVariants} className="mb-8">
            <motion.span
              className="px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-mono inline-flex items-center gap-2"
              whileHover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                🚀
              </motion.span>
              Developer Matching Platform
            </motion.span>
          </motion.div>
        </Reveal>

        {/* Main Title with Neon Effect */}
        <Reveal delay={0.1}>
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-bold leading-none select-none mb-4"
            variants={itemVariants}
          >
            <NeonText color="blue" pulse>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                FinderDev
              </span>
            </NeonText>
          </motion.h1>
        </Reveal>

        {/* Subtitle with typing effect */}
        <Reveal delay={0.2}>
          <motion.h2
            className="text-xl md:text-3xl lg:text-4xl font-medium text-white/90 mt-2 leading-tight select-none"
            variants={itemVariants}
          >
            <TypingText text="Find Developers, Build Together" />
          </motion.h2>
        </Reveal>

        {/* Description */}
        <Reveal delay={0.3}>
          <motion.p
            className="max-w-[700px] text-lg md:text-xl text-white/60 mt-8 leading-relaxed select-none"
            variants={itemVariants}
          >
            Yetenekli geliştiricileri keşfet, heyecan verici projeleri incele ve
            fikirlerini hayata geçirmek için <span className="text-blue-400">işbirliği</span> yap.
          </motion.p>
        </Reveal>

        {/* Smart Search */}
        <div className="w-full mt-10 mb-8 relative z-20">
          <Reveal delay={0.4}>
            <SmartSearch />
          </Reveal>
        </div>

        {/* CTA Buttons - Static */}
        <Reveal delay={0.5}>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <div className="group">
              <Button asChild size="lg" className="text-lg px-10 py-7 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 shadow-2xl shadow-blue-500/30 border-0 relative overflow-hidden transition-all duration-300">
                <Link href="/projects/create">
                  <span className="relative z-10 flex items-center gap-2">
                    <span>🚀</span>
                    Proje Başlat
                  </span>
                </Link>
              </Button>
            </div>

            <div>
              <Button asChild size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-blue-400/50 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 backdrop-blur-sm transition-all duration-300">
                <Link href="/projects">
                  <span className="flex items-center gap-2">
                    <span>👀</span>
                    Projeleri İncele
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Tech Stack Icons */}
        <Reveal delay={0.5}>
          <motion.div
            className="mt-16 flex items-center gap-8 opacity-40"
            variants={itemVariants}
          >
            {["React", "Node.js", "TypeScript", "Python", "Go"].map((tech, i) => (
              <Floating key={tech} duration={3 + i * 0.5} distance={5}>
                <motion.span
                  className="text-sm font-mono text-white/60"
                  whileHover={{ opacity: 1 }}
                >
                  {tech}
                </motion.span>
              </Floating>
            ))}
          </motion.div>
        </Reveal>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-7 h-12 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
            animate={{ y: [0, 16, 0], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </motion.section>
  );
}
