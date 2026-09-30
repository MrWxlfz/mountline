import type { CSSProperties } from "react"
import { photoSrcSet, photoUrl, samplePhotos, type SamplePhotoId } from "@/lib/homepage/sample-photos"

/**
 * One of Bramble's sample photos, sized by the browser from Unsplash's image service. Inside
 * Bramble's pages it is decorative (those pages are hidden from assistive tech); pass `describe`
 * where the photo itself is the point, as in Capture.
 */
export function SamplePhoto({
  id,
  sizes,
  className,
  describe = false,
  eager = false,
  style,
}: {
  id: SamplePhotoId
  sizes: string
  className?: string
  describe?: boolean
  eager?: boolean
  style?: CSSProperties
}) {
  const photo = samplePhotos[id]
  return (
    // Plain <img>: next/image is unoptimized in this project, so it wouldn't add a srcset.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl(photo, 960)}
      srcSet={photoSrcSet(photo)}
      sizes={sizes}
      alt={describe ? photo.alt : ""}
      width={photo.width}
      height={photo.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={className}
      style={{ objectPosition: photo.focus, ...style }}
    />
  )
}
