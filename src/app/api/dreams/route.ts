import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { dreams as dreamsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {auth} from '@/lib/auth';
import {headers} from "next/headers"; // You should have this file for NextAuth configuration

// GET all dreams for current user
export async function GET(request: NextRequest) {
    try {
        const loadedHeaders = await headers();
        const session = await auth.api.getSession({ headers: loadedHeaders});

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const userDreams = await db.select().from(dreamsTable).where(
            eq(dreamsTable.userId, userId)
        );

        return NextResponse.json(userDreams);
    } catch (error) {
        console.error('Failed to fetch dreams:', error);
        return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 });
    }
}

// POST a new dream
export async function POST(request: NextRequest) {
    try {
        const loadedHeaders = await headers();
        const session = await auth.api.getSession({ headers: loadedHeaders});


        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const data = await request.json();

        // Validate required fields
        if (!data.dateKey || !data.content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if dream already exists for this date
        const existingDream = await db.select()
            .from(dreamsTable)
            .where(
                and(
                    eq(dreamsTable.dateKey, data.dateKey),
                    eq(dreamsTable.userId, userId)
                )
            )
            .limit(1);

        let savedDream;

        if (existingDream.length > 0) {
            // Update existing dream
            savedDream = await db.update(dreamsTable)
                .set({
                    content: data.content,
                    interpretation: data.interpretation || null,
                    title: data.title || null,
                    is_interpreted: !!data.interpretation
                })
                .where(
                    and(
                        eq(dreamsTable.dateKey, data.dateKey),
                        eq(dreamsTable.userId, userId)
                    )
                )
                .returning();
        } else {
            // Insert new dream
            savedDream = await db.insert(dreamsTable)
                .values({
                    dateKey: data.dateKey,
                    content: data.content,
                    interpretation: data.interpretation || null,
                    title: data.title || null,
                    is_interpreted: !!data.interpretation,
                    userId: userId
                })
                .returning();
        }

        return NextResponse.json(savedDream[0]);
    } catch (error) {
        console.error('Failed to save dream:', error);
        return NextResponse.json({ error: 'Failed to save dream' }, { status: 500 });
    }
}