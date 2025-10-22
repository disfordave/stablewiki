import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;

  if (!token) {
    return { error: "User not authenticated" };
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    return { error: "Failed to fetch user" };
  }

  const user = await res.json();
  return user;
}

export async function signOutUser() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("jwt");
  redirect(`/signin?success=${encodeURIComponent("Successfully signed out!")}`);
}
