import type { Metadata } from 'next'
import {
  Geist as FontSans,
  Geist_Mono as FontMono,
  EB_Garamond as FontSerif,
} from 'next/font/google'
import './globals.css'

const fontSans = FontSans({
  variable: '--font-sans',
  subsets: ['latin'],
})

const fontMono = FontMono({
  variable: '--font-mono',
  subsets: ['latin'],
})

const fontSerif = FontSerif({
  weight: '400',
  variable: '--font-serif',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '𝔪𝔞𝔯𝔤𝔦𝔫𝔞𝔩𝔦𝔞',
  description: 'AI annotated eBooks',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
