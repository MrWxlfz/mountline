"use client"

import Image from "next/image"
import { motion } from "motion/react"
import styles from "./event.module.css"

interface EventStageProps {
  active: boolean
}

/** Replace this component with the livestream, keynote, or announcement stage. */
export function EventStage({ active }: EventStageProps) {
  return (
    <main
      className={styles.eventStage}
      aria-label="Mountline event stage"
      aria-hidden={!active}
      inert={!active ? true : undefined}
    >
      <div className={styles.stageAtmosphere} aria-hidden="true" />
      <motion.div
        className={styles.stageContent}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.2 }}
      >
        <Image
          src="/brand/mountline-icon.svg"
          width={58}
          height={58}
          alt=""
          className={styles.stageIcon}
        />
        <p className={styles.eyebrow}>Mountline Event</p>
        <h1>Mountline</h1>
        <p>The next chapter starts now.</p>
      </motion.div>
    </main>
  )
}
