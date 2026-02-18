"use client";

import { motion } from "framer-motion";
import { Reveal, TiltCard, NeonText } from "@/components/effects/PremiumEffects";

const testimonials = [
    {
        id: 1,
        name: "Can Özkan",
        role: "Startup Kurucusu",
        avatar: "🧑‍💼",
        text: "FinderDev sayesinde ekibimize harika bir frontend developer bulduk. Platform çok kullanışlı ve geliştiriciler gerçekten yetenekli!",
        rating: 5,
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: 2,
        name: "Selin Yıldız",
        role: "Proje Yöneticisi",
        avatar: "👩‍💼",
        text: "İnanılmaz bir deneyimdi. 3 gün içinde projemize uygun 5 geliştirici buldum. Kesinlikle tavsiye ederim.",
        rating: 5,
        color: "from-purple-500 to-pink-500",
    },
    {
        id: 3,
        name: "Burak Aydın",
        role: "Full Stack Developer",
        avatar: "👨‍💻",
        text: "Freelancer olarak birçok harika projeye katıldım. Müşterilerle iletişim çok kolay ve ödemeler güvenli.",
        rating: 5,
        color: "from-green-500 to-emerald-500",
    },
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
    return (
        <Reveal delay={index * 0.15} direction={index === 1 ? "up" : index === 0 ? "left" : "right"}>
            <TiltCard glareEnable>
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden h-full"
                >
                    {/* Background glow */}
                    <motion.div
                        className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${testimonial.color} opacity-5 blur-3xl`}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />

                    {/* Quote icon with animation */}
                    <motion.div
                        className="text-5xl text-blue-500/30 mb-4"
                        animate={{
                            rotate: [0, 5, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        "
                    </motion.div>

                    {/* Text */}
                    <p className="text-white/80 mb-6 leading-relaxed text-lg relative z-10">{testimonial.text}</p>

                    {/* Rating with staggered animation */}
                    <div className="flex gap-1 mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                                className="text-yellow-400 text-xl"
                            >
                                ⭐
                            </motion.span>
                        ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        <motion.div
                            className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-2xl`}
                            whileHover={{}}
                        >
                            {testimonial.avatar}
                        </motion.div>
                        <div>
                            <h4 className="text-white font-semibold text-lg">{testimonial.name}</h4>
                            <p className="text-white/50 text-sm">{testimonial.role}</p>
                        </div>
                    </div>

                    {/* Decorative quote mark at bottom */}
                    <div className="absolute bottom-4 right-6 text-6xl text-white/5 font-serif rotate-180">"</div>
                </motion.div>
            </TiltCard>
        </Reveal>
    );
}

export function Testimonials() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-green-950/5 to-slate-950" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <Reveal>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <motion.span
                            className="px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-mono inline-block mb-6"
                            whileHover={{ scale: 1.05 }}
                        >
                            💬 Kullanıcı Yorumları
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            <NeonText color="green">Topluluğumuz Ne Diyor?</NeonText>
                        </h2>
                        <p className="text-white/60 max-w-2xl mx-auto text-lg">
                            FinderDev kullanıcılarının deneyimleri ve başarı hikayeleri.
                        </p>
                    </motion.div>
                </Reveal>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
