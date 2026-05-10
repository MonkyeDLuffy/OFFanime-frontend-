import getMalId from "./getMalId.utils";

const API =
  "https://anime-details-api.onrender.com/api/jikan/anime";

export default async function getJikanInfo(anilistId) {
  try {
    // convert anilist -> MAL
    const malId = await getMalId(anilistId);

    if (!malId) {
      console.log("No MAL ID found");

      return null;
    }

    const response = await fetch(`${API}/${malId}`);

    const json = await response.json();

    if (!json?.data) return null;

    return json.data;
  } catch (err) {
    console.log("Jikan fetch failed:", err);

    return null;
  }
}
