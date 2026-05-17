"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Phone,
  Flame,
  Utensils,
  Calendar,
  Users,
  Truck,
} from "lucide-react"

const menuHighlights = [
  {
    name: "Ember Brisket Bowl",
    description: "12-hour smoked brisket, charred corn, pickled onion, oak-fired sauce",
    price: "$18",
    category: "Signature",
  },
  {
    name: "Hot Honey Flatbread",
    description: "Crisp crust, mozzarella, chili honey, basil, roasted garlic",
    price: "$16",
    category: "Flatbreads",
  },
  {
    name: "Market Greens",
    description: "Seasonal greens, toasted seeds, citrus vinaigrette, grilled protein option",
    price: "$14",
    category: "Salads",
  },
  {
    name: "Wood-Fired Chicken",
    description: "Half chicken, herb butter, seasonal vegetables, warm bread",
    price: "$24",
    category: "Mains",
  },
]

const hours = [
  { day: "Monday - Thursday", lunch: "11am - 2pm", dinner: "5pm - 9pm" },
  { day: "Friday - Saturday", lunch: "11am - 3pm", dinner: "5pm - 10pm" },
  { day: "Sunday", lunch: "10am - 3pm", dinner: "4pm - 8pm" },
]

const features = [
  { icon: Flame, title: "Wood-Fired", description: "Authentic oak fire cooking" },
  { icon: MapPin, title: "Local First", description: "Farm partnerships within 50 miles" },
  { icon: Users, title: "Events", description: "Private dining for up to 40 guests" },
  { icon: Truck, title: "Catering", description: "Full-service off-site catering" },
]

export function RestaurantDemo() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#F8F5F0] text-[#2D2926]">
      <DemoNotice />
      <Hero />
      <QuickInfo />
      <MenuSection />
      <StorySection />
      <HoursSection />
      <ContactSection submitted={submitted} onSubmit={handleSubmit} />
      <FinalCta />
      <AttributionFooter />
    </main>
  )
}

function DemoNotice() {
  return (
    <div className="sticky top-0 z-50 border-b border-[#2D2926]/10 bg-[#F8F5F0]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm text-[#6B635B] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Concept build by Mountline Studio. This is a sample website direction, not a real client.</p>
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2D2926] px-3 py-1.5 text-xs font-medium text-[#2D2926] transition-colors hover:bg-[#2D2926] hover:text-[#F8F5F0]"
        >
          Back to Mountline
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Warm textured background */}
      <div className="absolute inset-0 bg-[#2D2926]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(217,119,6,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(180,83,9,0.15),transparent_50%)]" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="text-center">
          {/* Logo mark */}
          <div className="mx-auto mb-8 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#D97706]" />
            <Flame className="h-8 w-8 text-[#D97706]" />
            <div className="h-px w-12 bg-[#D97706]" />
          </div>
          
          <h1 className="font-serif text-5xl font-light tracking-tight text-white sm:text-6xl lg:text-8xl">
            Ember & Oak
          </h1>
          
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Wood-fired flavors, locally sourced ingredients, and the warmth of gathering around a table.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#menu"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D97706] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[#B45309]"
            >
              View menu
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Make a reservation
            </a>
          </div>
        </div>
        
        {/* Hero visual - stylized plate */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-[#1a1614] shadow-2xl">
            {/* Plate illustration */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 360">
              {/* Table surface */}
              <rect x="0" y="280" width="640" height="80" fill="#3D3632" />
              
              {/* Main plate */}
              <ellipse cx="320" cy="200" rx="180" ry="40" fill="#E8E0D5" />
              <ellipse cx="320" cy="195" rx="160" ry="35" fill="#F5F0E8" />
              
              {/* Food elements */}
              <ellipse cx="280" cy="180" rx="40" ry="15" fill="#8B4513" opacity="0.9" />
              <ellipse cx="350" cy="175" rx="30" ry="12" fill="#228B22" opacity="0.8" />
              <circle cx="300" cy="165" r="8" fill="#D97706" />
              <circle cx="340" cy="160" r="6" fill="#B45309" />
              
              {/* Steam lines */}
              <path d="M260 140 Q 265 120, 255 100" stroke="#D97706" strokeWidth="2" fill="none" opacity="0.4" />
              <path d="M320 130 Q 325 110, 315 90" stroke="#D97706" strokeWidth="2" fill="none" opacity="0.3" />
              <path d="M380 135 Q 385 115, 375 95" stroke="#D97706" strokeWidth="2" fill="none" opacity="0.4" />
              
              {/* Utensils */}
              <rect x="480" y="150" width="8" height="120" rx="4" fill="#888" transform="rotate(15 484 210)" />
              <rect x="140" y="150" width="8" height="120" rx="4" fill="#888" transform="rotate(-15 144 210)" />
              
              {/* Ambient glow */}
              <ellipse cx="320" cy="200" rx="200" ry="50" fill="url(#warmGlow)" opacity="0.3" />
              
              <defs>
                <radialGradient id="warmGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
            </svg>
            
            {/* Corner badge */}
            <div className="absolute bottom-4 right-4 rounded-full bg-[#D97706] px-4 py-2">
              <span className="text-sm font-semibold text-white">Now Open</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickInfo() {
  return (
    <section className="border-b border-[#2D2926]/10 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-center">
              <feature.icon className="mb-3 h-6 w-6 text-[#D97706]" />
              <p className="font-semibold text-[#2D2926]">{feature.title}</p>
              <p className="text-sm text-[#6B635B]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MenuSection() {
  return (
    <section id="menu" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#D97706]">The Menu</p>
          <h2 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">
            Wood-fired favorites
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#6B635B]">
            Fresh ingredients, bold flavors, and the unmistakable char of oak fire.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {menuHighlights.map((item) => (
            <div
              key={item.name}
              className="group flex gap-6 rounded-2xl border border-[#2D2926]/10 bg-white p-6 transition-all hover:border-[#D97706]/30 hover:shadow-lg"
            >
              {/* Visual placeholder */}
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5]">
                <Utensils className="h-8 w-8 text-[#D97706]/50" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#D97706]">{item.category}</p>
                    <h3 className="mt-1 font-serif text-xl text-[#2D2926]">{item.name}</h3>
                  </div>
                  <span className="text-lg font-semibold text-[#D97706]">{item.price}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#6B635B]">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#D97706] transition-colors hover:text-[#B45309]"
          >
            View full menu
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

function StorySection() {
  return (
    <section className="bg-[#2D2926] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#D97706]">Our Story</p>
            <h2 className="font-serif text-4xl font-light tracking-tight text-white sm:text-5xl">
              Fire, flavor, and community
            </h2>
            <p className="mt-6 leading-relaxed text-white/70">
              Ember & Oak started with a simple belief: the best meals happen when good ingredients meet live fire and gather good people. Our oak-burning kitchen brings out flavors you cannot replicate any other way.
            </p>
            <p className="mt-4 leading-relaxed text-white/70">
              We source from local farms within 50 miles, butcher in-house, and let the fire do the talking. Whether you are here for a weekday lunch or a Saturday celebration, you are part of the family.
            </p>
          </div>
          
          {/* Story visual */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#1a1614]">
              <svg className="h-full w-full" viewBox="0 0 400 300">
                {/* Stylized fire pit */}
                <rect x="100" y="200" width="200" height="60" rx="8" fill="#3D3632" />
                <rect x="120" y="180" width="160" height="30" rx="4" fill="#1a1614" />
                
                {/* Flames */}
                <path d="M160 180 Q 170 140, 160 100 Q 150 140, 160 180" fill="#D97706" opacity="0.8" />
                <path d="M200 180 Q 215 120, 200 80 Q 185 120, 200 180" fill="#F59E0B" opacity="0.9" />
                <path d="M240 180 Q 250 140, 240 100 Q 230 140, 240 180" fill="#D97706" opacity="0.8" />
                
                {/* Sparks */}
                <circle cx="170" cy="70" r="3" fill="#FCD34D" opacity="0.7" />
                <circle cx="210" cy="60" r="2" fill="#FCD34D" opacity="0.6" />
                <circle cx="230" cy="75" r="2.5" fill="#FCD34D" opacity="0.7" />
                
                {/* Wood logs */}
                <rect x="130" y="200" width="60" height="15" rx="4" fill="#8B4513" transform="rotate(-10 160 207)" />
                <rect x="210" y="200" width="60" height="15" rx="4" fill="#6D3913" transform="rotate(10 240 207)" />
              </svg>
            </div>
            
            {/* Quote overlay */}
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-[#D97706] p-6 shadow-xl lg:-bottom-8 lg:-left-8">
              <p className="font-serif text-lg italic text-white">&ldquo;Good food, better company.&rdquo;</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HoursSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#D97706]">Visit Us</p>
            <h2 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">
              Hours & Location
            </h2>
            
            <div className="mt-8 space-y-4">
              {hours.map((schedule) => (
                <div key={schedule.day} className="flex items-center justify-between border-b border-[#2D2926]/10 pb-4">
                  <span className="font-medium text-[#2D2926]">{schedule.day}</span>
                  <div className="text-right text-sm text-[#6B635B]">
                    <p>Lunch: {schedule.lunch}</p>
                    <p>Dinner: {schedule.dinner}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-2xl border border-[#2D2926]/10 bg-white p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D97706]/10">
                <MapPin className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2D2926]">Location</h3>
                <p className="mt-1 text-[#6B635B]">
                  123 Oak Street<br />
                  Downtown District<br />
                  City, ST 12345
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D97706]/10">
                <Phone className="h-6 w-6 text-[#D97706]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#2D2926]">Reservations</h3>
                <p className="mt-1 text-[#6B635B]">(555) 123-4567</p>
                <p className="text-sm text-[#6B635B]">Walk-ins always welcome</p>
              </div>
            </div>
            
            {/* Map placeholder */}
            <div className="mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-gradient-to-br from-[#F5F0E8] to-[#E8E0D5]">
              <div className="flex h-full items-center justify-center">
                <MapPin className="h-12 w-12 text-[#D97706]/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection({
  submitted,
  onSubmit,
}: {
  submitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section id="contact" className="border-t border-[#2D2926]/10 bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#D97706]">Get in Touch</p>
            <h2 className="font-serif text-4xl font-light tracking-tight sm:text-5xl">
              Reservations & Catering
            </h2>
            <p className="mt-6 text-[#6B635B]">
              Planning a special dinner, private event, or need catering for your next gathering? We would love to hear from you.
            </p>
            
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D97706]/10">
                  <Calendar className="h-6 w-6 text-[#D97706]" />
                </div>
                <div>
                  <p className="font-semibold text-[#2D2926]">Reservations</p>
                  <p className="text-sm text-[#6B635B]">Book up to 2 weeks in advance</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D97706]/10">
                  <Users className="h-6 w-6 text-[#D97706]" />
                </div>
                <div>
                  <p className="font-semibold text-[#2D2926]">Private Events</p>
                  <p className="text-sm text-[#6B635B]">Parties of 10+ welcome</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl border border-[#2D2926]/10 bg-[#F8F5F0] p-8">
            {submitted ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D97706]">
                  <Check className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-[#2D2926]">Message received</h3>
                <p className="mt-3 max-w-sm text-sm text-[#6B635B]">
                  This is a demo. In production, we would confirm your request within 24 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#2D2926]">Name</span>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="h-12 w-full rounded-xl border border-[#2D2926]/10 bg-white px-4 text-sm text-[#2D2926] outline-none transition-colors placeholder:text-[#6B635B]/50 focus:border-[#D97706]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#2D2926]">Email</span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-xl border border-[#2D2926]/10 bg-white px-4 text-sm text-[#2D2926] outline-none transition-colors placeholder:text-[#6B635B]/50 focus:border-[#D97706]"
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#2D2926]">Request Type</span>
                    <select className="h-12 w-full rounded-xl border border-[#2D2926]/10 bg-white px-4 text-sm text-[#2D2926] outline-none transition-colors focus:border-[#D97706]">
                      <option>Reservation</option>
                      <option>Private Event</option>
                      <option>Catering Inquiry</option>
                      <option>General Question</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#2D2926]">Preferred Date</span>
                    <input
                      type="date"
                      className="h-12 w-full rounded-xl border border-[#2D2926]/10 bg-white px-4 text-sm text-[#2D2926] outline-none transition-colors focus:border-[#D97706]"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#2D2926]">Details</span>
                  <textarea
                    placeholder="Party size, timing, dietary needs, or any questions..."
                    className="min-h-32 w-full rounded-xl border border-[#2D2926]/10 bg-white px-4 py-3 text-sm text-[#2D2926] outline-none transition-colors placeholder:text-[#6B635B]/50 focus:border-[#D97706]"
                  />
                </label>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#D97706] px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-[#B45309]">
                  Send request
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="bg-[#2D2926] px-4 py-24 text-center sm:py-32">
      <div className="mx-auto max-w-3xl">
        <Flame className="mx-auto mb-6 h-10 w-10 text-[#D97706]" />
        <h2 className="font-serif text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
          Good food awaits
        </h2>
        <p className="mt-6 text-lg text-white/70">
          Join us for wood-fired flavors and warm hospitality.
        </p>
        <a
          href="#contact"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-[#D97706] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-[#B45309]"
        >
          Make a reservation
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}

function AttributionFooter() {
  return (
    <footer className="border-t border-[#2D2926]/10 bg-[#F8F5F0] px-4 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-[#6B635B] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Flame className="h-6 w-6 text-[#D97706]" />
          <div>
            <p className="font-serif text-lg text-[#2D2926]">Ember & Oak</p>
            <p className="text-xs">Demo concept by Mountline Studio</p>
          </div>
        </div>
        <Link
          href="/#contact"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2D2926] px-5 py-3 font-medium text-[#2D2926] transition-colors hover:bg-[#2D2926] hover:text-white"
        >
          Get a site like this
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </footer>
  )
}
