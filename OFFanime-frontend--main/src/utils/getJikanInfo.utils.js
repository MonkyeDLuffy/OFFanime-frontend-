const API = "https://anime-details-api.onrender.com/api/jikan/from-anilist";

export default async function getJikanInfo(anilistId) {
  try {
    const response = await fetch(`${API}/${anilistId}`);

    if (!response.ok) {
      throw new Error(`Jikan API failed: ${response.status}`);
    }

    const json = await response.json();

    return json?.data || null;
  } catch (err) {
    console.log("Jikan fetch failed:", err.message);
    return null;
  }
}
