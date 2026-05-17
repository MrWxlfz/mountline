import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://mountline.dev'),
  title: 'Mountline Studio',
  description: 'Websites, client portals, and practical digital systems for businesses that need to look sharper online.',
  openGraph: {
    title: 'Mountline Studio',
    description: 'Websites, client portals, and practical digital systems for businesses that need to look sharper online.',
    url: 'https://mountline.dev',
    siteName: 'Mountline Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Mountline Studio',
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
    <html lang="en" suppressHydrationWarning className="bg-black">
      <body className="font-sans antialiased bg-black text-white">
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
