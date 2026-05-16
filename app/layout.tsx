import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://nthline.tech'),
  title: 'Northline Services',
  description: 'Websites, client portals, and practical digital systems for businesses that need to look sharper online.',
  openGraph: {
    title: 'Northline Services',
    description: 'Websites, client portals, and practical digital systems for businesses that need to look sharper online.',
    url: 'https://nthline.tech',
    siteName: 'Northline Services',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Northline Services',
    description: 'Websites, client portals, and practical digital systems for businesses that need to look sharper online.',
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
          </ThemeProvider>
        </ClerkProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
