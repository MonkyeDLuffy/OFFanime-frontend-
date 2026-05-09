import axios from "axios";

export default async function getSearch(keyword, page = 1) {
  const api_url = import.meta.env.VITE_API_URL;

  try {
    if (!keyword || !keyword.trim()) return [];

    const searchText = keyword.trim();

    const res = await axios.get(`${api_url}/search`, {
      params: {
        query: searchText,
        q: searchText,
        keyword: searchText,
        page,
      },
      timeout: 30000,
    });

    const data =
      res.data?.data ||
      res.data?.results?.data ||
      res.data?.results ||
      [];

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}