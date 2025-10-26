/*
    StableWiki is a modern, open-source wiki platform focused on simplicity,
    collaboration, and ease of use.

    Copyright (C) 2025 @disfordave

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
