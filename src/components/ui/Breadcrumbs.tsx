import Link from "next/link";

export function Breadcrumbs({
  slug,
  titles,
}: {
  slug: string[];
  titles: string[];
}) {
  return (
    <>
      <p className="text-sm">
        {slug.map((_, index) => (
          <span key={index}>
            <Link
              href={`/wiki/${decodeURIComponent(slug.slice(0, index + 1).join("/"))}`}
              className={`${
                index === slug.length - 1 ? "font-semibold" : "font-medium"
              } ${slug.length - 1 === index ? "text-gray-500" : "text-blue-600 hover:underline dark:text-blue-500"}`}
            >
              {titles[index]}
            </Link>
            {index < slug.length - 1 && " / "}
          </span>
        ))}
      </p>
    </>
  );
}
