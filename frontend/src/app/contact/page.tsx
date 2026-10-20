import { getSiteSettings } from '@/lib/cms';
import ContactContent from './ContactContent';

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return <ContactContent settings={settings} />;
}
