import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, role } = body;

        if (!name || !email) {
            return NextResponse.json({ success: false, error: 'Name and Email are required' }, { status: 400 });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                role: role || 'USER',
            },
        });

        return NextResponse.json({ success: true, data: newUser }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            await prisma.user.delete({
                where: { id: parseInt(id, 10) },
            });
            return NextResponse.json({ success: true, message: `User ${id} deleted` });
        } else {
            // If no ID is passed, clean table for reset
            await prisma.user.deleteMany({});
            return NextResponse.json({ success: true, message: 'All users reset' });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
