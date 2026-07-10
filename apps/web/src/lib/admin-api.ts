const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    return payload.message ?? `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

function getAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem("adminToken") ?? "";
}

export async function adminJsonRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Missing admin token.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

export async function adminFormRequest<T>(path: string, formData: FormData, method: "POST" | "PUT" = "POST"): Promise<T> {
  const token = getAdminToken();
  if (!token) {
    throw new Error("Missing admin token.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    cache: "no-store",
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<T>;
}
