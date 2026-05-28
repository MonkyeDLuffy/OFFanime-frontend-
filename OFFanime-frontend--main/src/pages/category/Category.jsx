import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import getCategoryInfo from "@/src/utils/getCategoryInfo.utils";
import { createAnimeSlug } from "@/src/utils/slug.utils";

const ITEMS_PER_PAGE = 24;

export default function Category({ path, label }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const startPage = Number(searchParams.get("page")) || 1;

  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(startPage);
  const [hasNextPage, setHasNextPage] = useState(false);

  const title = label || path?.split("-").join(" ") || "Anime";

  useEffect(() => {
    async function loadCategory() {
      setLoading(true);

      try {
        const data = await getCategoryInfo(path, page);

        const results = data?.results || data?.data || data?.animes || [];

        setAnime(Array.isArray(results) ? results : []);
        setHasNextPage(Array.isArray(results) && results.length >= ITEMS_PER_PAGE);
      } catch (err) {
        console.error("Category load failed:", err);
        setAnime([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [path, page]);

  function changePage(pageNumber) {
    if (pageNumber < 1) return;

    setPage(pageNumber);
    setSearchParams({ page: String(pageNumber) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white px-6 pt-28 pb-20">
      <div className="max-w-[1500px] mx-auto">
        <h1 className="text-3xl font-bold capitalize mb-8">{title}</h1>

        {loading && <p className="text-gray-400">Loading...</p>}

        {!loading && anime.length === 0 && (
          <p className="text-gray-400">No results found for: {title}</p>
        )}

        {!loading && anime.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-5">
              {anime.map((item, index) => {
                const id = item.id || item.anilistId;
                const animeTitle =
                  item.title || item.name || item.animeTitle || "Unknown";

                const poster =
                  item.poster ||
                  item.image ||
                  item.cover ||
                  item.coverImage ||
                  "";

                return (
                  <Link
                    key={`${id}-${index}`}
                    to={`/${createAnimeSlug(animeTitle, id)}`}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10">
                      <img
                        src={poster}
                        alt={animeTitle}
                        loading="lazy"
                        className="w-full h-[280px] object-cover group-hover:scale-105 transition duration-300"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <span className="absolute bottom-2 left-2 bg-black/70 text-xs px-2 py-1 rounded uppercase">
                        {item.type || "TV"}
                      </span>
                    </div>

                    <h3 className="mt-3 font-semibold line-clamp-1">
                      {animeTitle}
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {item.year || "Unknown"} • {item.episodes || "?"} EPS
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3 mt-14">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className={`px-5 py-3 rounded-full border font-bold ${
                  page === 1
                    ? "opacity-40 cursor-not-allowed border-white/10"
                    : "border-white/20 hover:bg-white hover:text-black"
                }`}
              >
                ← Prev
              </button>

              <button className="w-12 h-12 rounded-full bg-white text-black font-black">
                {page}
              </button>

              <button
                onClick={() => changePage(page + 1)}
                disabled={!hasNextPage}
                className={`px-5 py-3 rounded-full border font-bold ${
                  !hasNextPage
                    ? "opacity-40 cursor-not-allowed border-white/10"
                    : "border-white/20 hover:bg-white hover:text-black"
                }`}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
