export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error || `HTTP error! Status: ${response.status}`;
    console.error("API Error Details:", errorData.details);
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}
