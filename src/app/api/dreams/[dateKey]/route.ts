import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { dreams as dreamsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
// DELETE a dream by dateKey
export async function DELETE(
    request: NextRequest,
    { params }: { params: { dateKey: string } }
) {
    try {
        const loadedHeaders = await headers();
        const session = await auth.api.getSession({ headers: loadedHeaders});


        if (!session?.user?.id) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { dateKey } = params;

        if (!dateKey) {
            return NextResponse.json({ error: 'Missing date key' }, { status: 400 });
        }

        await db.delete(dreamsTable)
            .where(
                and(
                    eq(dreamsTable.dateKey, dateKey),
                    eq(dreamsTable.userId, userId)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete dream:', error);
        return NextResponse.json({ error: 'Failed to delete dream' }, { status: 500 });
    }
}

// GET a specific dream by dateKey
export async function GET(
    request: NextRequest,
    { params }: { params: { dateKey: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { dateKey } = params;

        if (!dateKey) {
            return NextResponse.json({ error: 'Missing date key' }, { status: 400 });
        }

        const dream = await db.select()
            .from(dreamsTable)
            .where(
                and(
                    eq(dreamsTable.dateKey, dateKey),
                    eq(dreamsTable.userId, userId)
                )
            )
            .limit(1);

        if (dream.length === 0) {
            return NextResponse.json({ error: 'Dream not found' }, { status: 404 });
        }

        return NextResponse.json(dream[0]);
    } catch (error) {
        console.error('Failed to fetch dream:', error);
        return NextResponse.json({ error: 'Failed to fetch dream' }, { status: 500 });
    }
}