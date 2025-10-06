import { WIKI_NAME } from "@/lib/config";

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold">{WIKI_NAME}</h1>
    </div>
  );
}
