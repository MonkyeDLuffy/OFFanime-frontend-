import axios from "axios";

export default async function getCategoryInfo(path, page = 1) {
  const api_url = import.meta.env.VITE_API_URL;

  try {
    const cleanPath = String(path || "").replace(/^\/+/, "");

    const url = cleanPath.startsWith("az-list")
      ? `${api_url}/category/${cleanPath}`
      : `${api_url}/category/${cleanPath}`;

    const response = await axios.get(url, {
      params: { page },
      timeout: 30000,
    });

    return response.data || { results: [], data: [], totalPages: 1 };
  } catch (error) {
    console.error("Category fetch error:", error);
    return { results: [], data: [], totalPages: 1 };
  }
}