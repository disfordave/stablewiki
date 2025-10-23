import { WIKI_COPYRIGHT_HOLDER, WIKI_COPYRIGHT_HOLDER_URL } from "@/config";

export default function Footer() {
  return (
    <footer className="rounded-t-2xl bg-white px-4 py-8 text-center sm:rounded-2xl dark:bg-gray-800">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()}{" "}
        <a
          href={WIKI_COPYRIGHT_HOLDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {WIKI_COPYRIGHT_HOLDER}
        </a>
      </p>
    </footer>
  );
}
