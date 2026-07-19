"use client"

import Image from "next/image"
import { motion } from "motion/react"
import styles from "./event.module.css"

interface EventEntryProps {
  busy: boolean
  onEnter: (withSound: boolean) => void
}

export function EventEntry({ busy, onEnter }: EventEntryProps) {
  return (
    <motion.section
      className={styles.entry}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="event-entry-title"
    >
      <div className={styles.entryBrand}>
        <Image
          src="/brand/mountline-icon.svg"
          width={64}
          height={64}
          alt="Mountline"
          priority
          className={styles.entryIcon}
        />
        <p>A Mountline Experience</p>
      </div>

      <div className={styles.entryCopy}>
        <p className={styles.eyebrow}>The room is open</p>
        <h1 id="event-entry-title">Welcome.</h1>
        <p>Choose how you would like to enter.</p>
      </div>

      <div className={styles.entryActions}>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={busy}
          onClick={() => onEnter(true)}
        >
          {busy ? "Entering…" : "Enter with sound"}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={busy}
          onClick={() => onEnter(false)}
        >
          Continue without sound
        </button>
      </div>
    </motion.section>
  )
}
