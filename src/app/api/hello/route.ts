
export async function GET() {
    return new Response(JSON.stringify({ message: 'Hello! Your API is working.' }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

// You can also handle POST requests if needed
export async function POST() {
    return new Response(JSON.stringify({ message: 'Hello from POST!' }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}