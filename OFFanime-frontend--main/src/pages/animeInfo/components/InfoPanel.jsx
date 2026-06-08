import {
  faCalendarDays,
  faClock,
  faClosedCaptioning,
  faMicrophone,
  faSignal,
  faTv,
  faForward,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function InfoPanel({ anime, episodes = [] }) {
  const info = anime?.animeInfo || {};

  const status = info.Status || anime?.status;
  const year = info.Aired || anime?.year;
  const season =
    info.Premiered ||
    (anime?.season && anime?.year ? `${anime.season} ${anime.year}` : null);
  const type = info.Type || anime?.type;
  const duration =
    info.Duration || (anime?.duration ? `${anime.duration} min` : null);
  const totalEpisodes =
    episodes?.length ||
    info.Episodes ||
    anime?.episodes ||
    anime?.totalEpisodes ||
    null;
  const dubEpisodes =
    info.Dub ||
    info.Dubbed ||
    anime?.dubEpisodes ||
    anime?.dubEpisode ||
    anime?.tvInfo?.dub ||
    null;

  const nextEpisode = getNextEpisodeInfo(anime);
  const studios = info.Studios || anime?.studios || [];

  const data = [
    { label: "Episodes", value: totalEpisodes, icon: faClosedCaptioning },
    { label: "Dub Episodes", value: dubEpisodes || "Check", icon: faMicrophone },
    { label: "Status", value: status, icon: faSignal },
    { label: "Type", value: type, icon: faTv },
    { label: "Duration", value: duration, icon: faClock },
    { label: "Season", value: season || year, icon: faCalendarDays },
  ].filter((item) => item.value);

  return (
    <div className="mt-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.map((item) => (
          <div
            key={item.label}
            className="group bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 hover:border-white/25 hover:-translate-y-1 transition duration-300"
          >
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <FontAwesomeIcon icon={item.icon} className="text-xs" />
              <p className="text-[10px] uppercase tracking-[0.16em]">
                {item.label}
              </p>
            </div>
            <p className="font-black text-sm text-white line-clamp-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {nextEpisode && (
        <div className="mt-5 bg-white text-black border border-white rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-black/60 mb-1">
            <FontAwesomeIcon icon={faForward} className="text-xs" />
            <p className="text-[10px] uppercase tracking-[0.16em]">
              Next Episode
            </p>
          </div>
          <p className="text-sm font-black">{nextEpisode}</p>
        </div>
      )}

      {studios?.length > 0 && (
        <div className="mt-5 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400 mb-1">
            Studios
          </p>
          <p className="text-sm leading-relaxed text-white">
            {Array.isArray(studios) ? studios.join(", ") : studios}
          </p>
        </div>
      )}
    </div>
  );
}

function getNextEpisodeInfo(anime) {
  const next =
    anime?.nextAiringEpisode ||
    anime?.airingEpisode ||
    anime?.animeInfo?.nextAiringEpisode ||
    null;

  const episodeNumber = next?.episode || next?.number || null;

  if (episodeNumber && next?.airingAt) {
    return `EP ${episodeNumber} drops in ${formatCountdown(next.airingAt)}`;
  }

  if (episodeNumber) {
    return `EP ${episodeNumber} coming soon`;
  }

  if (/airing|releasing|currently/i.test(String(anime?.status || ""))) {
    return "Next episode date will update soon";
  }

  return "";
}

function formatCountdown(airingAt) {
  const now = Math.floor(Date.now() / 1000);
  const seconds = Number(airingAt) - now;

  if (!Number.isFinite(seconds) || seconds <= 0) return "soon";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}
