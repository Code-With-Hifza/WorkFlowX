import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, createSession } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, parsed.email));

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'EMAIL_IN_USE', message: 'An account with this email already exists.' } },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: parsed.email,
        passwordHash,
        fullName: parsed.fullName,
        emailVerified: true,
      })
      .returning();

    await db.insert(userProfiles).values({
      userId: newUser.id,
      timezone: 'UTC',
      locale: 'en',
    });

    await createSession(newUser.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: err.errors[0].message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 }
    );
  }
}
