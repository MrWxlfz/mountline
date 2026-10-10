import { ServiceDots } from "@/components/site/icons"
import { IntroCleanup } from "@/components/site/home/intro-cleanup"
import { INTRO_SCRIPT } from "@/components/site/home/intro-script"

/**
 * The first-visit overlay: the four dots pop in at the center, then glide to their place in the hero.
 * Hidden by CSS unless the inline script below starts it, so it never flashes on later visits.
 */
export function Intro() {
  return (
    <>
      <div className="intro" id="intro" aria-hidden="true">
        <div className="dots" id="introDots">
          <ServiceDots full />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
      <IntroCleanup />
    </>
  )
}
