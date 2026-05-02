import { emptyMailFilters, type MailFilters, type MailView } from "@/lib/mail/types";

interface SearchParamsLike {
  get(name: string): string | null;
}

export function mailFiltersFromSearchParams(searchParams: SearchParamsLike): MailFilters {
  const unreadParam = searchParams.get("unread");
  const maxResultsParam = searchParams.get("maxResults");
  const maxResults = maxResultsParam ? Number.parseInt(maxResultsParam, 10) : null;

  return {
    ...emptyMailFilters,
    search: searchParams.get("search") || emptyMailFilters.search,
    dateFrom: searchParams.get("dateFrom") || emptyMailFilters.dateFrom,
    dateTo: searchParams.get("dateTo") || emptyMailFilters.dateTo,
    sender: searchParams.get("sender") || emptyMailFilters.sender,
    unread: unreadParam === "true" ? true : unreadParam === "false" ? false : null,
    maxResults: maxResults && maxResults > 0 ? maxResults : emptyMailFilters.maxResults,
  };
}

export function mailFiltersEqual(left: MailFilters, right: MailFilters) {
  return (
    left.search === right.search &&
    left.dateFrom === right.dateFrom &&
    left.dateTo === right.dateTo &&
    left.sender === right.sender &&
    left.unread === right.unread &&
    left.maxResults === right.maxResults
  );
}

function mailFilterSearchParams(filters: MailFilters) {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set("search", filters.search.trim());
  }
  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }
  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }
  if (filters.sender) {
    params.set("sender", filters.sender);
  }
  if (filters.unread !== null) {
    params.set("unread", String(filters.unread));
  }
  if (filters.maxResults) {
    params.set("maxResults", String(filters.maxResults));
  }

  return params;
}

export function mailFilterHref(view: MailView, filters: MailFilters) {
  const params = mailFilterSearchParams(filters);
  const query = params.toString();

  return query ? `/${view}?${query}` : `/${view}`;
}
