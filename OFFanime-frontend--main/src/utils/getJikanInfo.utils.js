const API =
  "https://anime-details-api.onrender.com/api/jikan/anime";

export default async function getJikanInfo(id) {
  try {
    const response = await fetch(`${API}/${id}`);

    const json = await response.json();

    if (!json?.data) {
      console.log("No Jikan data found");
      return null;
    }

    return json.data;
  } catch (err) {
    console.log("Jikan fetch failed:", err);

    return null;
  }
}
