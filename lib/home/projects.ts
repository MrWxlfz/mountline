export type HomeProject = {
  id: string
  name: string
  category: string
  objective: string
  desktop: string
  mobile: string
  href: string
  /** subtle reflected-light tint used by the hero and explorer */
  tint: string
  caption: string
}

export const heroProjects: HomeProject[] = [
  {
    id: "sliders",
    name: "Served Sliders",
    category: "Restaurant",
    objective: "Get the menu, hours and a call button in front of hungry people fast.",
    desktop: "/site-shots/sliders-desktop.png",
    mobile: "/site-shots/sliders-mobile.png",
    href: "https://slidersdemo.mountline.dev",
    tint: "rgba(224, 122, 60, 0.16)",
    caption: "Menu, hours and one-tap calling for a Keller slider shop.",
  },
  {
    id: "ruffscrub",
    name: "Ruff Scrub",
    category: "Dog grooming",
    objective: "Make booking a bath as easy as it should be.",
    desktop: "/site-shots/ruffscrub-desktop.png",
    mobile: "/site-shots/ruffscrub-mobile.png",
    href: "https://ruffscrubdemo.mountline.dev",
    tint: "rgba(228, 160, 60, 0.14)",
    caption: "A warm, family-owned grooming studio that books itself.",
  },
  {
    id: "barber",
    name: "Rick's Barbershop",
    category: "Barber shop",
    objective: "Walk-in confidence: services, chairs and a phone number, no fluff.",
    desktop: "/site-shots/barber-desktop.png",
    mobile: "/site-shots/barber-mobile.png",
    href: "https://barber.mountline.dev",
    tint: "rgba(200, 200, 205, 0.10)",
    caption: "Sharp cuts, no fuss — the site matches the shop.",
  },
  {
    id: "nomad",
    name: "Nomad Auto Spa",
    category: "Mobile detailing",
    objective: "Turn \u201cdetailing that comes to you\u201d into calls from the driveway.",
    desktop: "/site-shots/nomad-desktop.png",
    mobile: "/site-shots/nomad-mobile.png",
    href: "https://autodemo.mountline.dev",
    tint: "rgba(226, 68, 57, 0.13)",
    caption: "Services and service area for detailing across DFW.",
  },
]

export const explorerProjects: HomeProject[] = [
  ...heroProjects,
  {
    id: "elevation",
    name: "Elevation",
    category: "Church",
    objective: "Help a first-time visitor plan a visit before Sunday.",
    desktop: "/site-shots/elevation-desktop.png",
    mobile: "/site-shots/elevation-mobile.png",
    href: "https://churchdemo.mountline.dev",
    tint: "rgba(240, 130, 50, 0.14)",
    caption: "Visit planning, service times and ministries for every generation.",
  },
  {
    id: "cleaning",
    name: "Commercial Cleaning",
    category: "Commercial services",
    objective: "Earn trust from office managers and make the walkthrough easy to request.",
    desktop: "/site-shots/cleaning-desktop.png",
    mobile: "/site-shots/cleaning-mobile.png",
    href: "https://cleaningdemo.mountline.dev",
    tint: "rgba(80, 130, 190, 0.12)",
    caption: "A locally-run cleaning crew that looks as reliable as it is.",
  },
]

export const conceptDisclaimer =
  "Concept previews built by Mountline — demonstration sites, not official client websites."
