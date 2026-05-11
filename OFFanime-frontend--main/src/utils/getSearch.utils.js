const API = "https://anime-details-api.onrender.com";

export default async function getSearch(keyword) {
  try {
    const q = keyword?.trim();

    if (!q || q.length < 2) return [];

    const response = await fetch(
      `${API}/api/search?keyword=${encodeURIComponent(q)}`
    );

    if (!response.ok) {
      throw new Error(`Search API failed: ${response.status}`);
    }

    const json = await response.json();

    return json?.results || [];
  } catch (error) {
    console.log("Search failed:", error.message);
    return [];
  }
}
