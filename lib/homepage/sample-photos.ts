/**
 * Sample photography for Bramble, the made-up dog groomer in Mountline's design demonstrations.
 *
 * Every image is a free photo from Unsplash, used under the Unsplash License (commercial use allowed,
 * no attribution required; we credit the photographers anyway). None were taken by Mountline, none
 * show a Mountline client, and the page labels them as sample imagery wherever they appear.
 * Checked on 2026-09-29 that none are Unsplash+ (paid) photos.
 */

export type SamplePhotoId = "work" | "room" | "door" | "dryer" | "result"

export type SamplePhoto = {
  src: string
  width: number
  height: number
  /** Written for a person who can't see the image. Bramble's own pages hide it from assistive tech. */
  alt: string
  /** Default object-position, so every crop keeps the subject. */
  focus: string
  credit: { name: string; page: string }
}

export const samplePhotos: Record<SamplePhotoId, SamplePhoto> = {
  work: {
    src: "https://images.unsplash.com/photo-1719464454959-9cf304ef4774",
    width: 5892,
    height: 3928,
    alt: "A groomer’s hands trimming the fur around a small white dog’s face with scissors",
    focus: "38% 42%",
    credit: { name: "Buddy AN", page: "https://unsplash.com/photos/LpK2xddrElI" },
  },
  room: {
    src: "https://images.unsplash.com/photo-1651502829291-785542414770",
    width: 4032,
    height: 3024,
    alt: "A schnauzer standing on a grooming table beside a bright window",
    focus: "55% 55%",
    credit: { name: "Donna Jones", page: "https://unsplash.com/photos/TMMTeDNPkeE" },
  },
  door: {
    src: "https://images.unsplash.com/photo-1763168829003-33755769b975",
    width: 5058,
    height: 6322,
    alt: "An Open sign hanging in a shop doorway",
    focus: "50% 70%",
    credit: { name: "Tim Mossholder", page: "https://unsplash.com/photos/swFaHS__Nkw" },
  },
  dryer: {
    src: "https://images.unsplash.com/photo-1625321150203-cea4bee44b54",
    width: 6595,
    height: 4397,
    alt: "A long-haired dog being brushed and blow-dried",
    focus: "50% 45%",
    credit: { name: "J. Balla Photography", page: "https://unsplash.com/photos/cMtiWjiAvq4" },
  },
  result: {
    src: "https://images.unsplash.com/photo-1678203778548-5fa399d8e7fb",
    width: 6705,
    height: 4470,
    alt: "A freshly groomed small dog in a green bandana",
    focus: "50% 40%",
    credit: { name: "Karsten Winegeart", page: "https://unsplash.com/photos/KIVQIZnDbWI" },
  },
}

const widths = [320, 480, 640, 960, 1280, 1800]

/** Unsplash's image service resizes and picks AVIF or WebP for the browser. */
export function photoUrl(photo: SamplePhoto, width: number) {
  return `${photo.src}?w=${width}&q=72&auto=format&fit=max`
}

export function photoSrcSet(photo: SamplePhoto, max = 1800) {
  return widths.filter((width) => width <= max).map((width) => `${photoUrl(photo, width)} ${width}w`).join(", ")
}
