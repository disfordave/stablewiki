import { Page } from "@/types/types";

function StableDate({ page, isOld }: { page: Page; isOld: boolean }) {
  return (
    <p className="text-sm text-gray-500">
      {isOld ? "Edited by " : "Last edited by "}{" "}
      <span className="font-semibold">
        {page.author ? page.author.username : "Unknown"}
      </span>{" "}
      on{" "}
      <span className="font-semibold">
        {new Date(page.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
          timeZone: "UTC",
        })}
      </span>
    </p>
  );
}

export { StableDate };