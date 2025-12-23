/**
 * Generic fetch wrapper for JSON API calls
 */
export const fetchJson = async <T>(url: string, options: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${errorText}`);
  }

  return response.json();
};
