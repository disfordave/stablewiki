export async function POST(request: Request) {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
        return Response.json({ error: "Email and password are required" }, { status: 400 });
    }

    try {
        // Here you would normally destroy the session or JWT token
        return Response.json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to sign out" }, { status: 500 });
    }
}