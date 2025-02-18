export function createSearchParamsMessageUrl(
  url: string,
  message: string,
  type: "success" | "error" = "success"
): string {
  const searchParams = new URLSearchParams();
  searchParams.set("message", message);
  searchParams.set("type", type);
  return `${url}?${searchParams.toString()}`;
}
