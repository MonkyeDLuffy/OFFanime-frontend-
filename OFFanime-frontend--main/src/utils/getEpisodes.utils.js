import axios from "axios";

export default async function getEpisodes(id) {
  const api_url = import.meta.env.VITE_API_URL;

  try {
    const response = await axios.get(`${api_url}/episodes/${id}`, {
      timeout: 120000,
      params: {
        refresh: true,
      },
    });

    const episodes = response.data?.results || [];

    return episodes
      .map((ep, index) => {
        const epNumber =
          Number(ep.number) ||
          Number(ep.episodeNumber) ||
          Number(ep.episodeId) ||
          index + 1;

        return {
          ...ep,
          id: ep.id || epNumber,
          number: epNumber,
          episodeId: epNumber,
          episodeNumber: epNumber,
          title: ep.title || `Episode ${epNumber}`,
        };
      })
      .sort((a, b) => Number(a.number) - Number(b.number));
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}
