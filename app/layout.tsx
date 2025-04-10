import { Toaster } from 'sonner'
import './globals.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    
    <html lang="en">
      <body>
      <Toaster />
      {children}</body>
    </html>
  )
}
