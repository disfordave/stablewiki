import { redirect } from "next/navigation";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/solid";

export async function SearchBox() {
  async function search(formData: FormData) {
    "use server";
    const query = formData.get("search")?.toString() || "";
    // Go to search page
    redirect(`/wiki/System:Search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form action={search} className="relative mt-2 flex w-full gap-2">
      <input
        type="text"
        name="search"
        className="w-full rounded-full bg-gray-100 px-4 py-1 focus:ring-2 focus:ring-violet-500 focus:outline-none dark:bg-gray-900"
        placeholder="Search..."
        required
      />
      <button type="submit" className="absolute end-0">
        <MagnifyingGlassCircleIcon className="-m-1 inline-block size-10 cursor-pointer text-violet-500 transition-colors duration-300 hover:text-violet-600" />
      </button>
    </form>
  );
}
