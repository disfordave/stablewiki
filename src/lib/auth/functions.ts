import { cookies } from "next/headers";

export async function getUser() {
  let user = null;
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  const res = await fetch("http://localhost:3000/api/auth/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  user = await res.json();

  return user;
}

export async function signOutUser() {
  "use server";
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (token) {
    cookieStore.delete("jwt");
  }
}
