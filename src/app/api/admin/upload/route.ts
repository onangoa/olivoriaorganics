import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES_PER_REQUEST = 12;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: 'Invalid upload request.' }, { status: 400 });
  }

  const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return Response.json({ error: 'No files were uploaded.' }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_REQUEST) {
    return Response.json(
      { error: `Upload at most ${MAX_FILES_PER_REQUEST} photos at a time.` },
      { status: 400 }
    );
  }

  const uploaded: { id: string; url: string; filename: string }[] = [];

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return Response.json(
        { error: `"${file.name}" is not a supported image type (JPEG, PNG, WebP, GIF, or AVIF).` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: `"${file.name}" is larger than 5 MB.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await prisma.image.create({
      data: {
        filename: file.name.slice(0, 255) || 'photo',
        mimeType: file.type,
        size: buffer.length,
        data: buffer,
      },
    });

    uploaded.push({ id: image.id, url: `/api/images/${image.id}`, filename: image.filename });
  }

  await logActivity({
    action: 'image.upload',
    entity: 'Image',
    message: `Uploaded ${uploaded.length} image${uploaded.length === 1 ? '' : 's'} — ${uploaded.map((f) => f.filename).join(', ')}.`,
    userEmail: session.user.email ?? 'unknown user',
  });

  return Response.json({ files: uploaded }, { status: 201 });
}
