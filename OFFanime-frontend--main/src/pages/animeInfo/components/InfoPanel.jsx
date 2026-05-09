export default function InfoPanel({ anime }) {
  const info = anime.animeInfo || {};

  const data = [
    { label: "Status", value: info.Status || anime.status },
    { label: "Year", value: info.Aired || anime.year },
    { label: "Score", value: info["MAL Score"] || anime.score },
    {
      label: "Season",
      value:
        info.Premiered ||
        (anime.season && anime.year
          ? `${anime.season} ${anime.year}`
          : null),
    },
    { label: "Type", value: info.Type || anime.type },
    {
      label: "Duration",
      value: info.Duration || (anime.duration ? `${anime.duration} min` : null),
    },
  ].filter((item) => item.value);

  const studios = info.Studios || anime.studios || [];

  return (
    <div className="mt-10">
      {/* MAIN GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.map((item) => (
          <div
            key={item.label}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition"
          >
            <p className="text-xs text-gray-400 mb-1">
              {item.label}
            </p>
            <p className="font-semibold text-sm">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* STUDIOS (FULL WIDTH) */}
      {studios.length > 0 && (
        <div className="mt-5 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400 mb-1">
            Studios
          </p>
          <p className="text-sm leading-relaxed">
            {Array.isArray(studios)
              ? studios.join(", ")
              : studios}
          </p>
        </div>
      )}
    </div>
  );
}