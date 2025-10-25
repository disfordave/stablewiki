import { getUser } from "@/lib/auth/functions";
import { redirect } from "next/navigation";

export default async function App() {
  const user = await getUser();

  if (!user.username) {
    return redirect("/wiki/System_SignIn");
  }

  return redirect("/wiki/System_Dashboard");
}
