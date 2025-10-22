// import { prisma } from "@/lib/prisma";

export async function DELETE(): Promise<Response> {
  // const body = await request.json();
  // const { username } = body;

  return Response.json(
    {
      error: "The user deletion endpoint has been disabled.",
    },
    { status: 403 },
  );

  // if (!username) {
  //   return Response.json({ error: "Username is required" }, { status: 400 });
  // }

  // try {
  //   const user = await prisma.user.findUnique({
  //     where: { username: username },
  //   });

  //   if (!user) {
  //     return Response.json({ error: "User not found" }, { status: 404 });
  //   }

  //   await prisma.user.delete({
  //     where: { username: username },
  //   });

  //   return Response.json(
  //     { message: "User deleted successfully" },
  //     { status: 200 }
  //   );
  // } catch (error) {
  //   console.error("Error deleting user:", error);
  //   return Response.json({ error: "Internal server error" }, { status: 500 });
  // }
}
