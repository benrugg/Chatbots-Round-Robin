import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Round Robin Chooser",
  description: "Choose reviewers in a round-robin style",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <div className="min-h-screen bg-gradient-to-b from-transparent to-gray-100 dark:from-gray-700 dark:to-gray-800">{children}</div>
      </body>
    </html>
  )
}
