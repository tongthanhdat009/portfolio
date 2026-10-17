import { revalidatePath } from 'next/cache';
import { createHmac, timingSafeEqual } from 'node:crypto';

function pathsFor(body: { type?: string; slug?: string | null; key?: string | null }): string[] {
  switch (body.type) {
    case 'project':
      return ['/work', `/work/${body.slug}`];
    case 'note':
      return ['/notes', `/notes/${body.slug}`];
    case 'experiment':
      return ['/lab', `/lab/${body.slug}`];
    case 'page':
      return body.key === 'home' ? ['/'] : [`/${body.key}`];
    default:
      return ['/'];
  }
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.NEXT_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ message: 'Revalidation not configured.' }, { status: 503 });
  }

  const timestamp = req.headers.get('X-Revalidate-Timestamp') ?? '';
  const nonce = req.headers.get('X-Revalidate-Nonce') ?? '';
  const signature = req.headers.get('X-Revalidate-Signature') ?? '';
  const raw = await req.text();

  const expected = createHmac('sha256', secret).update(`${timestamp}.${nonce}.${raw}`).digest('hex');

  const fresh = Math.abs(Date.now() / 1000 - Number(timestamp)) < 300;
  const valid =
    signature.length === expected.length &&
    (() => {
      try {
        return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
      } catch {
        return false;
      }
    })();

  if (!fresh || !valid) {
    return Response.json({ message: 'Invalid signature.' }, { status: 403 });
  }

  const body = JSON.parse(raw) as { type?: string; slug?: string | null; key?: string | null };
  const paths = pathsFor(body);
  for (const path of paths) {
    revalidatePath(path);
  }

  return Response.json({ revalidated: true, paths });
}
