import Link from "next/link";

function RedirectedFrom({ from }: { from: string | string[] }) {
  return (
    <div className="mt-1 rounded-xl bg-gray-100 p-4 dark:bg-gray-900">
      <p className="">
        You were redirected here from{" "}
        <Link
          href={`/wiki/${Array.isArray(from) ? from.join("/") : from}?preventRedirect=true`}
          className="underline"
        >
          {Array.isArray(from)
            ? from.map((s) => decodeURIComponent(s)).join("/")
            : decodeURIComponent(from)}
        </Link>
        .
      </p>
    </div>
  );
}

export { RedirectedFrom };