const API =
  import.meta.env.VITE_API_URL ||
  "https://anime-details-api.onrender.com";

export default async function getSearch(keyword) {
  try {
    const q = keyword?.trim();

    if (!q || q.length < 2) return [];

    const response = await fetch(
      `${API}/api/jikan/search?q=${encodeURIComponent(q)}`
    );

    const json = await response.json();

    const results = json?.results || [];

    return results.map((anime) => ({
      id: anime.malId,
      anilistId: anime.malId,

      title: anime.titleEnglish || anime.title,
      name: anime.titleEnglish || anime.title,

      poster: anime.poster || anime.image,
      image: anime.image || anime.poster,
      banner: anime.image || anime.poster,
      bannerImage: anime.image || anime.poster,

      type: anime.type || "TV",
      year: anime.year || anime.aired?.string || "?",
      episodes: anime.episodes || "?",
      score: anime.score,
      status: anime.status,
      genres: anime.genres || [],
    }));
  } catch (error) {
    console.log("Search failed:", error.message);
    return [];
  }
}
