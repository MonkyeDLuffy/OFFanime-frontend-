import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { createAnimeSlug } from "@/src/utils/slug.utils";

const API_URL = import.meta.env.VITE_API_URL;

export default function ContinueWatching() {
  const [data, setData] = useState([]);

  useEffect(() => {
    let alive = true;

    async function loadContinueWatching() {
      try {
        const stored =
          JSON.parse(localStorage.getItem("continueWatching")) || [];

        const sorted = stored
          .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
          .slice(0, 10);

        const updated = await Promise.all(
          sorted.map(async (item) => {
            let episodeImage = "";

            try {
              const res = await fetch(`${API_URL}/tmdb/${item.id}`);
              const json = await res.json();

              const tmdbEpisodes = json?.data?.episodes || [];

              const foundEpisode = tmdbEpisodes.find(
                (ep) => Number(ep.episodeNumber) === Number(item.episode)
              );

              episodeImage = foundEpisode?.image || "";
            } catch (err) {
              console.log("Continue TMDB image error:", err);
            }

            return {
              ...item,
              episodeImage,
            };
          })
        );

        if (!alive) return;

        setData(updated);

        localStorage.setItem(
          "continueWatching",
          JSON.stringify(updated)
        );
      } catch (err) {
        console.error(err);
      }
    }

    loadContinueWatching();

    return () => {
      alive = false;
    };
  }, []);

  if (!data.length) return null;

  return (
    <div className="w-full mt-8">
      <h2 className="text-white text-3xl font-bold mb-5">
        Continue Watching
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {data.map((item, index) => {
          const title = item.title || "Anime";
          const slug = item.slug || item.animeSlug || createAnimeSlug(title, item.id);

          return (
            <Link
              key={`${item.id}-${item.episode}-${index}`}
              to={`/watch/${slug}?ep=${item.episode}`}
              className="group"
            >
              <div className="relative h-[145px] rounded-xl overflow-hidden bg-[#111] border border-white/10">
                {item.episodeImage ? (
                  <img
                    src={item.episodeImage}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#202020] via-[#111] to-black flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-bold">
                      EP {item.episode}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition">
                  ▶
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-white text-sm font-bold line-clamp-2">
                  {title}
                </h3>

                <p className="text-gray-400 text-sm mt-1">
                  Episode {item.episode}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
