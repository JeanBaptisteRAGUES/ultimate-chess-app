import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lazer Chess',
  description: 'Train your openings with laser precision',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className=' w-full h-[5vh] flex justify-center items-center bg-slate-950' >
          <Link className=' text-white text-xl italic font-semibold cursor-pointer' href={{pathname: '/'}} >Lazer Chess</Link>
        </header>
        {children}
      </body>
    </html>
  )
}
