import axios from "axios";

function cleanText(text = "") {
  return String(text)
    .replace(/<[^>]*>/g, "")
    .replace(/\\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\\"/g, '"')
    .trim();
}

function normalizeForTheme(item = {}) {
  const title = item.title || item.name || "Unknown";
  const poster = item.poster || item.image || "";
  const banner = item.banner || poster;

  return {
    id: item.id,
    anilistId: item.anilistId || item.id,
    title,
    name: title,
    animeTitle: title,
    japanese_title: item.japaneseTitle || "",
    poster,
    image: poster,
    banner,

    animeInfo: {
      Overview: cleanText(item.description),
      Genres: item.genres || [],
      Status: item.status || "",
      Type: item.type || "TV",
      Duration: item.duration ? `${item.duration} min` : "",
      Premiered: item.season && item.year ? `${item.season} ${item.year}` : "",
      Aired: item.year ? String(item.year) : "",
      Studios: item.studios || [],
      Producers: item.studios || [],
      "MAL Score": item.score || "",
      Japanese: item.japaneseTitle || "",
      Synonyms: "",

      tvInfo: {
        rating: item.score ? String(item.score) : "",
        quality: "HD",
        sub: item.episodes || "?",
        dub: item.episodes || "?",
      },
    },

    adultContent: false,
    charactersVoiceActors: [],
    recommended_data: [],
  };
}

export default async function fetchAnimeInfo(id, random = false) {
  const api_url = import.meta.env.VITE_API_URL;

  try {
    let animeId = id;

    if (random) {
      const homeRes = await axios.get(`${api_url}/home`);
      const list = homeRes.data?.results?.trending || [];
      animeId = list[Math.floor(Math.random() * list.length)]?.id;
    }

    if (!animeId) {
      throw new Error("Missing anime ID");
    }

    const response = await axios.get(`${api_url}/details/${animeId}`, {
      timeout: 30000,
    });

    const normalized = normalizeForTheme(response.data);

    return {
      data: normalized,
      seasons: [],
    };
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return null;
  }
}