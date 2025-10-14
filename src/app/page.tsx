import WikiList from "@/components/WikiList";
import { redirect } from "next/navigation";

export default function Home() {
  return redirect("/wiki/Welcome");
}
