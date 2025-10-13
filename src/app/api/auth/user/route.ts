import jwt from "jsonwebtoken";

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return Response.json(
      { error: "Error! Token was not provided." },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return Response.json(
      { error: "Error! Token was not provided." },
      { status: 401 }
    );
  }

  try {
    const decodedToken = jwt.verify(token, "secretkeyappearshere") as {
      id: string;
      username: string;
    };

    return Response.json(
      { id: decodedToken.id, username: decodedToken.username },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Invalid or expired token." },
      { status: 403 }
    );
  }
}
