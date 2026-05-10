const API =
  import.meta.env.VITE_API_URL ||
  "https://anime-details-api.onrender.com";

export default async function getJikanInfo(anilistId) {
  try {
    const response = await fetch(
      `${API}/api/jikan/from-anilist/${anilistId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Jikan info");
    }

    const json = await response.json();

    return json?.data || null;
  } catch (err) {
    console.log("Jikan fetch failed:", err.message);
    return null;
  }
}
