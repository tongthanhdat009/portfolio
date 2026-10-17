import type { Metadata } from 'next';
import { Space_Grotesk, Manrope, IBM_Plex_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { getSiteSettings, getAnnouncement } from '@/lib/cms';
import { SkipLink } from '@/components/layout/SkipLink';
import { AnnouncementStrip } from '@/components/layout/AnnouncementStrip';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.ownerName}`,
    },
    description: settings.description,
    keywords: settings.seoDefaults.keywords,
    authors: [{ name: settings.ownerName }],
    creator: settings.ownerName,
    metadataBase: new URL('https://datnguyen.dev'),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://datnguyen.dev',
      title: settings.siteTitle,
      description: settings.description,
      siteName: settings.siteTitle,
      images: [
        {
          url: settings.seoDefaults.ogImage,
          width: 1200,
          height: 630,
          alt: settings.siteTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.siteTitle,
      description: settings.description,
      images: [settings.seoDefaults.ogImage],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const announcement = await getAnnouncement();

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen flex flex-col font-body bg-[#FFF9E9] text-[#111111]">
        <SkipLink />
        <AnnouncementStrip data={announcement} />
        <Header settings={settings} />
        <main id="main-content" className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
