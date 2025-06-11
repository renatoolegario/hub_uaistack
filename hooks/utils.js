export async function fetchFromApi(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

import { createClient } from '@vercel/postgres';

export function getDbClient() {
  return createClient();
}
