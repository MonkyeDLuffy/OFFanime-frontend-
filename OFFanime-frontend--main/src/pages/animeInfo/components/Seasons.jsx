import { Link } from "react-router-dom";
import { createAnimeSlug } from "@/src/utils/slug.utils";

export default function Seasons({ data = [] }) {
  if (!data.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-5">Seasons & Movies</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {data.map((anime) => (
          <Link key={anime.id} to={`/${createAnimeSlug(anime.title, anime.id)}`} className="group">
            <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10">
              <img
                src={anime.poster || anime.image}
                alt={anime.title}
                className="w-full h-[240px] object-cover group-hover:scale-105 transition duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <span className="absolute top-2 left-2 bg-black/70 text-xs px-2 py-1 rounded">
                {anime.relationType?.replace("_", " ")}
              </span>

              <span className="absolute bottom-2 left-2 bg-black/70 text-xs px-2 py-1 rounded">
                {anime.type || "TV"}
              </span>
            </div>

            <h3 className="mt-3 font-semibold line-clamp-1">
              {anime.title}
            </h3>

            <p className="text-xs text-gray-400 mt-1">
              {anime.year || "Unknown"} • {anime.episodes || "?"} EPS
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
