import { getMedia } from '@/lib/cms/service';
import MediaClient from './MediaClient';

export const dynamic = 'force-dynamic';

export default async function MediaPage() {
  const media = await getMedia();
  return <MediaClient initialMedia={media} />;
}
