"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState, ReactNode } from "react";

// ==================== CURSOR FOLLOW SPOTLIGHT ====================
export function CursorSpotlight({ children }: { children: ReactNode }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="relative">
            {/* Spotlight effect */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
                animate={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.06), transparent 40%)`,
                }}
            />
            {children}
        </div>
    );
}

// ==================== 3D TILT CARD ====================
interface TiltCardProps {
    children: ReactNode;
    className?: string;
    glareEnable?: boolean;
}

export function TiltCard({ children, className = "", glareEnable = true }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={`relative ${className}`}
        >
            {/* Glare effect */}
            {glareEnable && (
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        background: useTransform(
                            [mouseXSpring, mouseYSpring],
                            ([latestX, latestY]) =>
                                `radial-gradient(circle at ${(latestX as number + 0.5) * 100}% ${(latestY as number + 0.5) * 100}%, rgba(255,255,255,0.15), transparent 40%)`
                        ),
                    }}
                />
            )}
            <div style={{ transform: "translateZ(50px)" }}>{children}</div>
        </motion.div>
    );
}

// ==================== GRADIENT BORDER ====================
interface GradientBorderProps {
    children: ReactNode;
    className?: string;
    borderWidth?: number;
    animate?: boolean;
}

export function GradientBorder({ children, className = "", borderWidth = 2, animate = true }: GradientBorderProps) {
    return (
        <div className={`relative p-[${borderWidth}px] rounded-2xl ${className}`}>
            {/* Animated gradient border */}
            <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                    background: "linear-gradient(90deg, #3b82f6, #06b6d4, #8b5cf6, #ec4899, #3b82f6)",
                    backgroundSize: "300% 100%",
                }}
                animate={animate ? {
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                } : undefined}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            {/* Inner content */}
            <div className="relative bg-slate-900 rounded-2xl">{children}</div>
        </div>
    );
}

// ==================== NEON GLOW TEXT ====================
interface NeonTextProps {
    children: ReactNode;
    color?: "blue" | "cyan" | "purple" | "green" | "pink";
    className?: string;
    pulse?: boolean;
}

export function NeonText({ children, color = "blue", className = "", pulse = true }: NeonTextProps) {
    const colors = {
        blue: { text: "text-blue-400", shadow: "#3b82f6" },
        cyan: { text: "text-cyan-400", shadow: "#06b6d4" },
        purple: { text: "text-purple-400", shadow: "#8b5cf6" },
        green: { text: "text-green-400", shadow: "#22c55e" },
        pink: { text: "text-pink-400", shadow: "#ec4899" },
    };

    const selectedColor = colors[color];

    return (
        <motion.span
            className={`${selectedColor.text} ${className}`}
            animate={pulse ? {
                textShadow: [
                    `0 0 2px ${selectedColor.shadow}40, 0 0 4px ${selectedColor.shadow}20`,
                    `0 0 4px ${selectedColor.shadow}40, 0 0 8px ${selectedColor.shadow}20`,
                    `0 0 2px ${selectedColor.shadow}40, 0 0 4px ${selectedColor.shadow}20`,
                ],
            } : undefined}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.span>
    );
}

// ==================== MORPHING BLOB ====================
export function MorphingBlob({ className = "" }: { className?: string }) {
    return (
        <motion.div
            className={`absolute rounded-full blur-3xl ${className}`}
            animate={{
                borderRadius: [
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                    "30% 60% 70% 40% / 50% 60% 30% 60%",
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                ],
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
            }}
            transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

// ==================== INTERACTIVE PARTICLES ====================
export function InteractiveParticles({ count = 30 }: { count?: number }) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const particles = [...Array(count)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 3 + Math.random() * 4,
    }));

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute bg-blue-400/30 rounded-full"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                    }}
                    animate={{
                        x: [0, (mousePos.x - (containerRef.current?.clientWidth || 0) / 2) * 0.02],
                        y: [0, (mousePos.y - (containerRef.current?.clientHeight || 0) / 2) * 0.02],
                        opacity: [0.2, 0.6, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// ==================== REVEAL ANIMATION WRAPPER ====================
interface RevealProps {
    children: ReactNode;
    direction?: "up" | "down" | "left" | "right";
    delay?: number;
    blur?: boolean;
}

export function Reveal({ children, direction = "up", delay = 0, blur = true }: RevealProps) {
    const directions = {
        up: { y: 50, x: 0 },
        down: { y: -50, x: 0 },
        left: { x: 50, y: 0 },
        right: { x: -50, y: 0 },
    };

    return (
        <motion.div
            initial={{
                opacity: 0,
                ...directions[direction],
                filter: blur ? "blur(10px)" : "blur(0px)",
            }}
            whileInView={{
                opacity: 1,
                x: 0,
                y: 0,
                filter: "blur(0px)",
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.8,
                delay,
                ease: "easeOut",
            }}
        >
            {children}
        </motion.div>
    );
}

// ==================== MAGNETIC BUTTON ====================
interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
}

export function MagneticButton({ children, className = "" }: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;
        x.set(distanceX * 0.2);
        y.set(distanceY * 0.2);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            transition={{ type: "spring", stiffness: 500, damping: 50 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ==================== FLOATING ANIMATION ====================
interface FloatingProps {
    children: ReactNode;
    duration?: number;
    distance?: number;
}

export function Floating({ children, duration = 3, distance = 10 }: FloatingProps) {
    return (
        <motion.div
            animate={{
                y: [-distance, distance, -distance],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            {children}
        </motion.div>
    );
}
