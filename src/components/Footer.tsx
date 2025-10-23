import { WIKI_COPYRIGHT_HOLDER, WIKI_COPYRIGHT_HOLDER_URL } from "@/config";

export default function Footer() {
  return (
    <footer className="mt-4 py-4 text-center">
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
