import WikiList from "@/components/WikiList";
import { WIKI_NAME } from "@/lib/config";

export default function Home() {
  return (
    <div className="min-h-screen p-4 mx-auto max-w-2xl">
      <h1 className="text-4xl font-bold">{WIKI_NAME}</h1>
      <WikiList />
    </div>
  );
}