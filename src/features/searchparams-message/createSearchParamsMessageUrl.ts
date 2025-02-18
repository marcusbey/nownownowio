export function createSearchParamsMessageUrl(
    baseUrl: string,
    message: string,
    type: "success" | "error" = "success"
) {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set("message", message);
    url.searchParams.set("type", type);
    return url.toString();
} 