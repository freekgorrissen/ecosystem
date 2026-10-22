import { useEffect, useState } from "react";

export type Page = "calendar" | "commute";

const PAGES: Page[] = ["calendar", "commute"];

// Pages live in the URL hash (#/commute): GitHub Pages can't serve other paths on refresh
function pageFromHash(): Page {
  const page = window.location.hash.replace(/^#\/?/, "");
  return PAGES.find((p) => p === page) ?? "calendar";
}

export function usePage(): [Page, (page: Page) => void] {
  const [page, setPage] = useState<Page>(pageFromHash);

  useEffect(() => {
    const handleHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = (newPage: Page) => {
    window.location.hash = `/${newPage}`;
  };

  return [page, navigate];
}
