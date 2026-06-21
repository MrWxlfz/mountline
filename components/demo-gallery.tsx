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

export function DemoGallery({
  layout = "wide",
}: {
  layout?: "compact" | "wide"
}) {
  return (
    <div
      className={
        layout === "compact"
          ? "grid gap-3 sm:grid-cols-2"
          : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {demoSites.map((site) => (
        <a
          key={site.href}
          href={site.href}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden border border-white/10 bg-zinc-950 transition-all duration-300 hover:-translate-y-1 hover:border-white/25"
        >
          <div className="relative aspect-video overflow-hidden bg-zinc-900">
            <Image
              src={site.image}
              alt={site.alt}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.025]"
              sizes={
                layout === "compact"
                  ? "(max-width: 639px) 100vw, 340px"
                  : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              }
            />
            {!site.available ? (
              <div className="absolute inset-0 grid place-items-center bg-black/55 px-4 text-center backdrop-blur-[2px]">
                <span className="border border-white/15 bg-black/75 px-3 py-2 text-xs font-medium text-zinc-200">
                  Build not published yet
                </span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-white">{site.title}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {site.available ? "Open live demo" : "Check demo status"}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
          </div>
        </a>
      ))}
    </div>
  )
}
