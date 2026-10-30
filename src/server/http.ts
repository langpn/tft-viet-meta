export async function fetchJsonResponse<T>(url: string, response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "unknown";
  if (!response.ok || !contentType.toLowerCase().includes("application/json")) {
    throw new Error(`HTTP ${response.status} ${contentType} from ${url}`);
  }
  return (await response.json()) as T;
}
