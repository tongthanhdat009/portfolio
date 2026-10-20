import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Portfolio Admin CMS',
  description: 'Modern Neo-Brutal Developer Portfolio Admin CMS',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-[var(--color-sun)] selection:text-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
