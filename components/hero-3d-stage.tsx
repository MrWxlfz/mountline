"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { DashboardMockup } from "./dashboard-mockup"
import { Navbar } from "./navbar"
import { LogoCloud } from "./logo-cloud"
import { FeatureCardsSection } from "./feature-cards-section"
import { AISection } from "./ai-section"
import { ProductDirectionSection } from "./product-direction-section"
import { WorkflowsSection } from "./workflows-section"
import { CtaSection } from "./cta-section"
import { Footer } from "./footer"
import { PricingSection } from "./pricing-section"
import { FAQSection } from "./faq-section"
import { WorkSection } from "./work-section"
import { TrustSection } from "./trust-section"
import { ContactSection } from "./contact-section"
import { NorthlinePattern } from "./northline-logo"

export function Hero3DStage() {
  const [yOffset, setYOffset] = useState(0)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95])

  useEffect(() => {
    const handleScroll = () => {
      const scrollYValue = window.scrollY
      const offset = Math.min(scrollYValue / 300, 1) * -20
      setYOffset(offset)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const baseTransform = {
    translateX: 2,
    scale: 1.2,
    rotateX: 47,
    rotateY: 31,
    rotateZ: 324,
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Stagger animation variants
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-zinc-950">
        <Navbar />
        
        {/* Background layers */}
        <NorthlinePattern />
        
        {/* Animated gradient orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute pointer-events-none animate-subtle-pulse"
          style={{
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "1000px",
            height: "700px",
            background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 40%, transparent 70%)",
          }}
        />
        
        {/* Secondary accent glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "60%",
            right: "10%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.05) 0%, transparent 60%)",
          }}
        />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Main content */}
        <div className="relative z-10 pt-28 flex flex-col">
          {/* Hero text - contained and centered */}
          <div className="w-full flex justify-center px-6 mt-16">
            <motion.div 
              className="w-full max-w-4xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Section eyebrow */}
              <motion.div 
                variants={itemVariants}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-subtle-pulse" />
                <span className="text-zinc-500 text-sm tracking-wide uppercase">Digital Studio</span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-[64px] font-medium text-white leading-[1.08] tracking-tight text-balance"
              >
                Websites and systems for businesses that are done looking average.
              </motion.h1>
              
              <motion.p
                variants={itemVariants}
                className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
              >
                Northline builds fast websites, clean landing pages, and simple digital systems for local businesses and small teams that need to look sharp and move faster.
              </motion.p>
              
              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
              >
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="group relative px-7 py-3.5 bg-white text-zinc-900 font-medium rounded-lg transition-all duration-300 text-sm overflow-hidden hover:shadow-lg hover:shadow-white/10"
                >
                  <span className="relative z-10">Get a free audit</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                <button 
                  onClick={() => scrollToSection('services')}
                  className="group text-zinc-300 font-medium hover:text-white transition-colors flex items-center gap-2 text-sm"
                >
                  View services
                  <span className="group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true">→</span>
                </button>
              </motion.div>
              
              {/* Premium chips */}
              <motion.div
                variants={containerVariants}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                {[
                  "Fast launches",
                  "Mobile-first",
                  "Clear pricing",
                  "Small team, focused work"
                ].map((chip, index) => (
                  <motion.span
                    key={chip}
                    variants={chipVariants}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-sm"
                  >
                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                    {chip}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* 3D Stage - full bleed */}
          <div
            className="relative mt-16"
            style={{
              width: "100vw",
              marginLeft: "-50vw",
              marginRight: "-50vw",
              position: "relative",
              left: "50%",
              right: "50%",
              height: "700px",
              marginTop: "-40px",
            }}
          >
            {/* Bottom fade gradient */}
            <div
              className="absolute bottom-0 left-0 right-0 h-80 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(to top, #09090b 30%, transparent 100%)",
              }}
            />

            {/* Perspective container */}
            <motion.div
              style={{
                transform: `translateY(${yOffset}px)`,
                transition: "transform 0.1s ease-out",
                contain: "strict",
                perspective: "4000px",
                perspectiveOrigin: "100% 0",
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
                position: "relative",
              }}
            >
              {/* Transformed base */}
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.6,
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
                style={{
                  transformOrigin: "0 0",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  width: "1600px",
                  height: "900px",
                  margin: "280px auto auto",
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  transform: `translate(${baseTransform.translateX}%) scale(${baseTransform.scale}) rotateX(${baseTransform.rotateX}deg) rotateY(${baseTransform.rotateY}deg) rotate(${baseTransform.rotateZ}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Glow effect behind mockup */}
                <div 
                  className="absolute -inset-4 rounded-2xl opacity-40"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
                    filter: "blur(40px)",
                  }}
                />
                
                {/* Mockup container */}
                <div 
                  className="relative w-full h-full rounded-xl overflow-hidden border border-zinc-800/80"
                  style={{
                    boxShadow: "0 0 80px -20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <DashboardMockup />
                </div>
              </motion.div>
            </motion.div>
          </div>

          <LogoCloud />
          <FeatureCardsSection />
          <AISection />
          <ProductDirectionSection />
          <WorkflowsSection />
          <PricingSection />
          <WorkSection />
          <TrustSection />
          <FAQSection />
          <CtaSection />
          <ContactSection />
          <Footer />
        </div>
      </section>
    </>
  )
}
