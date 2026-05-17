"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Clock,
  Scissors,
  Sparkles,
  Heart,
  Star,
  Calendar,
} from "lucide-react"

const services = [
  {
    title: "Precision Cuts",
    description: "Tailored cuts that enhance your natural features and personal style.",
    price: "From $65",
    icon: Scissors,
  },
  {
    title: "Color Services",
    description: "Full color, balayage, highlights, and toning with premium products.",
    price: "From $120",
    icon: Sparkles,
  },
  {
    title: "Styling",
    description: "Blowouts, updos, and event styling for any occasion.",
    price: "From $55",
    icon: Heart,
  },
  {
    title: "Treatments",
    description: "Deep conditioning, keratin, and restorative care for healthy hair.",
    price: "From $85",
    icon: Star,
  },
]

const galleryItems = [
  { title: "Signature Color", subtitle: "Balayage & Dimension" },
  { title: "Bridal Styling", subtitle: "Event Ready" },
  { title: "Precision Cuts", subtitle: "Modern & Classic" },
  { title: "Treatment Care", subtitle: "Healthy & Radiant" },
]

const testimonials = [
  {
    quote: "The attention to detail is exceptional. Every visit feels like a retreat.",
    author: "Sarah M.",
    service: "Color Client",
  },
  {
    quote: "Finally found a stylist who truly understands what I want.",
    author: "Emily R.",
    service: "Cut & Style",
  },
]

export function BeautyStudioDemo() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#2C2825]">
      <DemoNotice />
      <Hero />
      <ServicesSection />
      <GallerySection />
      <TestimonialsSection />
      <PricingSection />
      <BookingSection submitted={submitted} onSubmit={handleSubmit} />
      <FinalCta />
      <AttributionFooter />
    </main>
  )
}

function DemoNotice() {
  return (
    <div className="sticky top-0 z-50 border-b border-[#E8E4DE] bg-[#FAF8F5]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 text-sm text-[#6B6560] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Concept build by Mountline Studio. This is a sample website direction, not a real client.</p>
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2C2825] px-3 py-1.5 text-xs font-medium text-[#2C2825] transition-colors hover:bg-[#2C2825] hover:text-[#FAF8F5]"
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
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left content */}
          <div className="flex flex-col justify-center">
            <div className="mb-8 inline-flex w-fit items-center gap-3 text-xs font-medium uppercase tracking-[0.3em] text-[#9C958D]">
              <span className="h-px w-8 bg-[#C9B8A8]" />
              Vale Studio
            </div>
            
            <h1 className="font-serif text-5xl font-light leading-[1.1] tracking-tight text-[#2C2825] sm:text-6xl lg:text-7xl">
              Where beauty
              <br />
              <span className="italic">meets intention</span>
            </h1>
            
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#6B6560]">
              A sanctuary for those who appreciate the art of self-care. Experience personalized services in an atmosphere of calm sophistication.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#booking"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2C2825] px-7 py-4 text-sm font-medium text-[#FAF8F5] transition-all hover:bg-[#1a1816]"
              >
                Book an appointment
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium text-[#2C2825] transition-colors hover:text-[#9C958D]"
              >
                Explore services
              </a>
            </div>
          </div>

          {/* Right visual */}
          <HeroVisual />
        </div>
      </div>
      
      {/* Subtle decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9B8A8] to-transparent" />
    </section>
  )
}

function HeroVisual() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Main visual container */}
      <div className="relative">
        {/* Decorative circles */}
        <div className="absolute -left-8 -top-8 h-64 w-64 rounded-full border border-[#E8E4DE]" />
        <div className="absolute -bottom-4 -right-4 h-48 w-48 rounded-full bg-[#C9B8A8]/20" />
        
        {/* Main card */}
        <div className="relative z-10 overflow-hidden rounded-[2rem] border border-[#E8E4DE] bg-white p-8 shadow-2xl shadow-[#C9B8A8]/10">
          {/* Abstract hair silhouette */}
          <div className="relative h-80 w-72 overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8E4DE] to-[#D4CCC2]">
            {/* Stylized head/face shape */}
            <div className="absolute left-1/2 top-12 -translate-x-1/2">
              <div className="h-32 w-24 rounded-full bg-[#F5F2EE]" />
              <div className="absolute -top-4 left-1/2 h-40 w-32 -translate-x-1/2 rounded-t-full bg-[#2C2825]" />
            </div>
            
            {/* Flowing hair lines */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 288 320">
              <path
                d="M80 60 Q 60 120, 50 200 Q 45 260, 60 300"
                fill="none"
                stroke="#C9B8A8"
                strokeWidth="2"
              />
              <path
                d="M100 50 Q 70 130, 55 220 Q 50 280, 70 320"
                fill="none"
                stroke="#9C958D"
                strokeWidth="1.5"
              />
              <path
                d="M200 55 Q 220 130, 230 220 Q 235 280, 220 320"
                fill="none"
                stroke="#C9B8A8"
                strokeWidth="2"
              />
              <path
                d="M180 48 Q 210 120, 225 200 Q 230 270, 210 310"
                fill="none"
                stroke="#9C958D"
                strokeWidth="1.5"
              />
            </svg>

            {/* Accent elements */}
            <div className="absolute bottom-6 left-6 rounded-full bg-[#C9B8A8] px-4 py-2">
              <span className="text-xs font-medium text-white">Premium Care</span>
            </div>
          </div>
          
          {/* Info strip */}
          <div className="mt-6 flex items-center justify-between border-t border-[#E8E4DE] pt-6">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9C958D]">Established</p>
              <p className="mt-1 font-serif text-lg text-[#2C2825]">2018</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-[#9C958D]">Experience</p>
              <p className="mt-1 font-serif text-lg text-[#2C2825]">Elevated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServicesSection() {
  return (
    <section id="services" className="border-t border-[#E8E4DE] bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 grid gap-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#C9B8A8]">Our Services</p>
            <h2 className="font-serif text-4xl font-light tracking-tight text-[#2C2825] sm:text-5xl">
              Crafted with care,<br />delivered with expertise
            </h2>
          </div>
          <div className="flex items-end">
            <p className="max-w-md text-[#6B6560]">
              Each service is tailored to your unique needs, combining artistry with the finest products for results that speak for themselves.
            </p>
          </div>
        </div>

        {/* Services grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative overflow-hidden rounded-2xl border border-[#E8E4DE] bg-[#FAF8F5] p-6 transition-all hover:border-[#C9B8A8] hover:shadow-lg hover:shadow-[#C9B8A8]/10"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#C9B8A8]/10">
                <service.icon className="h-5 w-5 text-[#C9B8A8]" />
              </div>
              <h3 className="mb-2 font-serif text-xl text-[#2C2825]">{service.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#6B6560]">{service.description}</p>
              <p className="text-sm font-medium text-[#C9B8A8]">{service.price}</p>
              
              {/* Hover accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#C9B8A8] transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GallerySection() {
  return (
    <section className="border-t border-[#E8E4DE] bg-[#FAF8F5] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#C9B8A8]">Portfolio</p>
          <h2 className="font-serif text-4xl font-light tracking-tight text-[#2C2825] sm:text-5xl">
            Our work, your inspiration
          </h2>
        </div>

        {/* Asymmetric gallery grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item, index) => (
            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8E4DE] to-[#D4CCC2] ${
                index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
              }`}
            >
              <div className={`${index === 0 ? "h-[400px] sm:h-[500px]" : "h-[240px]"} relative`}>
                {/* Abstract visual representation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {index === 0 ? (
                    // Large featured item
                    <div className="relative h-64 w-48">
                      <div className="absolute left-1/2 top-0 h-40 w-32 -translate-x-1/2 rounded-t-full bg-[#2C2825]" />
                      <div className="absolute left-1/2 top-24 h-20 w-14 -translate-x-1/2 rounded-full bg-[#F5F2EE]" />
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 192 256">
                        <path d="M30 80 Q 20 150, 25 200 Q 28 230, 40 256" fill="none" stroke="#C9B8A8" strokeWidth="3" />
                        <path d="M160 80 Q 170 150, 165 200 Q 162 230, 150 256" fill="none" stroke="#C9B8A8" strokeWidth="3" />
                      </svg>
                    </div>
                  ) : (
                    // Smaller items
                    <div className="h-20 w-16 rounded-full bg-[#F5F2EE] shadow-lg" />
                  )}
                </div>
                
                {/* Overlay with info */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2C2825]/80 to-transparent p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#C9B8A8]">{item.subtitle}</p>
                  <p className="mt-1 font-serif text-xl text-white">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="border-t border-[#E8E4DE] bg-[#2C2825] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#C9B8A8]">Testimonials</p>
          <h2 className="font-serif text-4xl font-light tracking-tight text-white sm:text-5xl">
            Words from our guests
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-2xl border border-white/10 bg-white/5 p-8"
            >
              <div className="mb-6 flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#C9B8A8] text-[#C9B8A8]" />
                ))}
              </div>
              <p className="mb-6 font-serif text-xl leading-relaxed text-white/90">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div>
                <p className="font-medium text-white">{testimonial.author}</p>
                <p className="text-sm text-white/50">{testimonial.service}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  return (
    <section className="border-t border-[#E8E4DE] bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 grid gap-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#C9B8A8]">Service Menu</p>
            <h2 className="font-serif text-4xl font-light tracking-tight text-[#2C2825] sm:text-5xl">
              Transparent pricing,<br />exceptional value
            </h2>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Essential */}
          <div className="rounded-2xl border border-[#E8E4DE] bg-[#FAF8F5] p-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#9C958D]">Essential</p>
            <div className="mb-4 flex items-baseline gap-1">
              <span className="font-serif text-4xl text-[#2C2825]">$55</span>
              <span className="text-[#9C958D]">and up</span>
            </div>
            <p className="mb-6 text-sm text-[#6B6560]">Perfect for maintenance visits and simple styling needs.</p>
            <ul className="space-y-3">
              {["Precision cut", "Blowout styling", "Deep conditioning", "Scalp treatment"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#2C2825]">
                  <Check className="h-4 w-4 text-[#C9B8A8]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Signature - Featured */}
          <div className="relative rounded-2xl border-2 border-[#C9B8A8] bg-white p-8 shadow-xl shadow-[#C9B8A8]/10">
            <div className="absolute -top-3 left-6 rounded-full bg-[#C9B8A8] px-3 py-1 text-xs font-medium text-white">
              Most Popular
            </div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#C9B8A8]">Signature</p>
            <div className="mb-4 flex items-baseline gap-1">
              <span className="font-serif text-4xl text-[#2C2825]">$125</span>
              <span className="text-[#9C958D]">and up</span>
            </div>
            <p className="mb-6 text-sm text-[#6B6560]">Full-service experience with color and styling expertise.</p>
            <ul className="space-y-3">
              {["Color service", "Cut & style", "Treatment add-on", "Aftercare guidance", "Complimentary consultation"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#2C2825]">
                  <Check className="h-4 w-4 text-[#C9B8A8]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Consultation */}
          <div className="rounded-2xl border border-[#E8E4DE] bg-[#FAF8F5] p-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[#9C958D]">Consultation</p>
            <div className="mb-4 flex items-baseline gap-1">
              <span className="font-serif text-4xl text-[#2C2825]">Free</span>
              <span className="text-[#9C958D]">15 minutes</span>
            </div>
            <p className="mb-6 text-sm text-[#6B6560]">Get expert advice before committing to a service.</p>
            <ul className="space-y-3">
              {["Style assessment", "Color recommendation", "Product guidance", "Service planning"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-[#2C2825]">
                  <Check className="h-4 w-4 text-[#C9B8A8]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function BookingSection({
  submitted,
  onSubmit,
}: {
  submitted: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section id="booking" className="border-t border-[#E8E4DE] bg-[#FAF8F5] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#C9B8A8]">Book Now</p>
            <h2 className="font-serif text-4xl font-light tracking-tight text-[#2C2825] sm:text-5xl">
              Begin your experience
            </h2>
            <p className="mt-6 text-[#6B6560]">
              Schedule your appointment and let us create something beautiful together. New clients receive a complimentary consultation.
            </p>
            
            <div className="mt-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9B8A8]/10">
                  <Clock className="h-5 w-5 text-[#C9B8A8]" />
                </div>
                <div>
                  <p className="font-medium text-[#2C2825]">Tuesday - Saturday</p>
                  <p className="text-sm text-[#6B6560]">9:00 AM - 7:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9B8A8]/10">
                  <Calendar className="h-5 w-5 text-[#C9B8A8]" />
                </div>
                <div>
                  <p className="font-medium text-[#2C2825]">Flexible scheduling</p>
                  <p className="text-sm text-[#6B6560]">Same-week availability often open</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl border border-[#E8E4DE] bg-white p-8 shadow-xl shadow-[#C9B8A8]/5">
            {submitted ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9B8A8]">
                  <Check className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-6 font-serif text-2xl text-[#2C2825]">Request received</h3>
                <p className="mt-3 max-w-sm text-sm text-[#6B6560]">
                  This is a demo. In production, we would confirm your appointment within 24 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#2C2825]">Name</span>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="h-12 w-full rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] px-4 text-sm text-[#2C2825] outline-none transition-colors placeholder:text-[#9C958D] focus:border-[#C9B8A8]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#2C2825]">Phone</span>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="h-12 w-full rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] px-4 text-sm text-[#2C2825] outline-none transition-colors placeholder:text-[#9C958D] focus:border-[#C9B8A8]"
                    />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#2C2825]">Service</span>
                    <select className="h-12 w-full rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] px-4 text-sm text-[#2C2825] outline-none transition-colors focus:border-[#C9B8A8]">
                      <option>Cut & Style</option>
                      <option>Color Service</option>
                      <option>Full Transformation</option>
                      <option>Treatment</option>
                      <option>Consultation</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#2C2825]">Preferred date</span>
                    <input
                      type="date"
                      className="h-12 w-full rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] px-4 text-sm text-[#2C2825] outline-none transition-colors focus:border-[#C9B8A8]"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#2C2825]">Notes</span>
                  <textarea
                    placeholder="Tell us about your hair goals, current routine, or any concerns..."
                    className="min-h-32 w-full rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] px-4 py-3 text-sm text-[#2C2825] outline-none transition-colors placeholder:text-[#9C958D] focus:border-[#C9B8A8]"
                  />
                </label>
                <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2C2825] px-6 py-4 text-sm font-medium text-white transition-all hover:bg-[#1a1816]">
                  Request appointment
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
    <section className="border-t border-[#E8E4DE] bg-white px-4 py-24 text-center sm:py-32">
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[#C9B8A8]">Vale Studio</p>
        <h2 className="font-serif text-4xl font-light tracking-tight text-[#2C2825] sm:text-5xl lg:text-6xl">
          Your transformation awaits
        </h2>
        <p className="mt-6 text-lg text-[#6B6560]">
          Experience the difference of intentional beauty care.
        </p>
        <a
          href="#booking"
          className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-[#2C2825] px-8 py-4 text-sm font-medium text-white transition-all hover:bg-[#1a1816]"
        >
          Book your appointment
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  )
}

function AttributionFooter() {
  return (
    <footer className="border-t border-[#E8E4DE] bg-[#FAF8F5] px-4 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-[#6B6560] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-lg text-[#2C2825]">Vale Studio</p>
          <p className="mt-1 text-xs">Demo concept by Mountline Studio</p>
        </div>
        <Link
          href="/#contact"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2C2825] px-5 py-3 font-medium text-[#2C2825] transition-colors hover:bg-[#2C2825] hover:text-white"
        >
          Get a site like this
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </footer>
  )
}
