import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Newsreader } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import './homepage.css'

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f4ef' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d0c' },
  ],
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://mountline.dev'),
  title: 'Mountline',
  description: 'Websites for local businesses, with original photo and video by arrangement and AI receptionists for the calls your team can’t take.',
  openGraph: {
    title: 'Mountline',
    description: 'Websites for local businesses, with original photo and video by arrangement and AI receptionists for the calls your team can’t take.',
    url: 'https://mountline.dev',
    siteName: 'Mountline',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mountline',
    description: 'Websites for local businesses, with photo, video, and AI receptionists when you need them.',
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: 'Mountline',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} ${newsreader.variable} bg-background`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <ClerkProvider afterSignOutUrl="/">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="mountline-appearance"
            disableTransitionOnChange
          >
            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </ClerkProvider>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}
