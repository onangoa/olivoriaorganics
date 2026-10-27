import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) {
    return new Response('Not found', { status: 404 });
  }

  const body = new Uint8Array(image.data);

  return new Response(body, {
    headers: {
      'Content-Type': image.mimeType,
      'Content-Length': String(image.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
