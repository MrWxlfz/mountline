import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

export const demoSites = [
  {
    title: "Barber shop",
    href: "https://barber.mountline.dev",
    image: "/demo-previews/barber-shop.jpg",
    alt: "Barber shop website concept preview",
    available: true,
  },
  {
    title: "Dog groomer",
    href: "https://ruffscrubdemo.mountline.dev",
    image: "/demo-previews/dog-groomer.jpg",
    alt: "Dog grooming website concept preview",
    available: true,
  },
  {
    title: "Restaurant",
    href: "https://slidersdemo.mountline.dev",
    image: "/demo-previews/restaurant.jpg",
    alt: "Restaurant website concept preview",
    available: true,
  },
  {
    title: "Auto detailing",
    href: "https://autodemo.mountline.dev",
    image: "/demo-previews/auto-detailing.jpg",
    alt: "Auto detailing website concept preview",
    available: true,
  },
  {
    title: "Church",
    href: "https://churchdemo.mountline.dev",
    image: "/demo-previews/church.jpg",
    alt: "Church website concept preview",
    available: true,
  },
  {
    title: "HVAC",
    href: "https://hvacdemo.mountline.dev",
    image: "/demo-previews/hvac.jpg",
    alt: "HVAC demo awaiting a published build",
    available: false,
  },
  {
    title: "Commercial cleaning",
    href: "https://cleaningdemo.mountline.dev",
    image: "/demo-previews/commercial-cleaning.jpg",
    alt: "Commercial cleaning website concept preview",
    available: true,
  },
]

export function DemoGallery() {
  return (
    <ul className="ml-gallery">
      {demoSites.map((site) => (
        <li key={site.href}>
          <a href={site.href} target="_blank" rel="noreferrer" className="ml-gallery__item">
            <div className="ml-gallery__image">
              <Image src={site.image} alt={site.alt} fill sizes="(max-width: 640px) 100vw, 360px" />
              {!site.available ? <span className="ml-gallery__badge ml-mono">Not published yet</span> : null}
            </div>
            <div className="ml-gallery__meta">
              <span>{site.title}</span>
              <span className="ml-mono">
                {site.available ? "Open demo" : "Check status"}
                <ArrowUpRight aria-hidden="true" />
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  )
}
