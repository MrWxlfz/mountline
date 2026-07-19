"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import styles from "./event.module.css"

const MESSAGES = [
  ["Welcome.", "We’ll be starting shortly."],
  ["Something new", "is taking shape."],
  ["The signal", "begins shortly."],
  ["Stay close.", "We’re almost ready."],
] as const

interface RotatingMessageProps {
  reducedMotion: boolean
}

export function RotatingMessage({ reducedMotion }: RotatingMessageProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % MESSAGES.length)
    }, 13000)

    return () => window.clearInterval(interval)
  }, [])

  const message = MESSAGES[messageIndex]

  return (
    <div className={styles.messageFrame} aria-live="polite" aria-atomic="true">
      <AnimatePresence mode="wait">
        <motion.h1
          key={messageIndex}
          className={styles.waitingHeadline}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(7px)" }}
          transition={{ duration: reducedMotion ? 1.1 : 1.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{message[0]}</span>
          <span>{message[1]}</span>
        </motion.h1>
      </AnimatePresence>
    </div>
  )
}
