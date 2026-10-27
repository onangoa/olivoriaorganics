import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

const MAX_SHORT = 191;

function clean(value: unknown, max = MAX_SHORT): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact, type, subcategory, otherSubcategory, format, notes } = body ?? {};

    const cleanName = clean(name);
    const cleanContact = clean(contact);
    const cleanType = clean(type);

    if (!cleanName || !cleanContact || !cleanType) {
      return NextResponse.json(
        { error: 'Name, contact, and consultation type are required.' },
        { status: 400 }
      );
    }

    const allowedFormats = ['In-person', 'Virtual'];
    const cleanFormat = allowedFormats.includes(format) ? format : 'In-person';

    const booking = await prisma.consultationBooking.create({
      data: {
        name: cleanName,
        contact: cleanContact,
        type: cleanType,
        subcategory: clean(subcategory),
        otherSubcategory: clean(otherSubcategory),
        format: cleanFormat,
        notes: clean(notes, 5000),
      },
    });

    await logActivity({
      action: 'booking.create',
      entity: 'Booking',
      entityId: booking.id,
      message: `New consultation booking from "${cleanName}" — ${cleanType}${clean(subcategory) ? ` (${clean(subcategory)})` : ''}, ${cleanFormat}.`,
      userEmail: null,
    });

    return NextResponse.json({ ok: true, id: booking.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to save consultation booking:', error);
    return NextResponse.json(
      { error: 'Could not submit your request. Please try again or reach us on WhatsApp.' },
      { status: 500 }
    );
  }
}
