// Shared function to fetch page data
export async function getPageData(joinedSlug: string, queryParams: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${joinedSlug}${queryParams}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch page: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getLatestPageRevision(joinedSlug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pages/${joinedSlug}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch page revisions: ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
}
