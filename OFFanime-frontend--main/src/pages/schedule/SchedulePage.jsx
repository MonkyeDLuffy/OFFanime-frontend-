import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = "https://anime-details-api.onrender.com";

function getDateLabel(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const value = date.toISOString().split("T")[0];

  return {
    date,
    value,
    label:
      offset === 0
        ? "Today"
        : offset === 1
        ? "Tomorrow"
        : "Day After Tomorrow",
    dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
    shortDate: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  };
}

export default function SchedulePage() {
  const days = useMemo(() => [getDateLabel(0), getDateLabel(1), getDateLabel(2)], []);

  const [activeDay, setActiveDay] = useState(days[0]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);

      try {
        const res = await fetch(`${API}/api/schedule?date=${activeDay.value}`);
        const json = await res.json();

        setSchedule(Array.isArray(json?.results) ? json.results : []);
      } catch (err) {
        console.log("Schedule load failed:", err);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    }

    loadSchedule();
  }, [activeDay.value]);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-16">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
            Anime Schedule
          </h1>

          <p className="text-white/45 mt-4 max-w-2xl">
            Schedule page is separated from home to reduce AniList calls. Only
            today, tomorrow, and day after tomorrow are shown.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {days.map((day) => {
            const active = activeDay.value === day.value;

            return (
              <button
                key={day.value}
                onClick={() => setActiveDay(day)}
                className={`rounded-2xl px-5 py-5 border text-left transition ${
                  active
                    ? "bg-white text-black border-white shadow-[0_18px_60px_rgba(255,255,255,0.12)]"
                    : "bg-white/[0.04] text-white border-white/10 hover:bg-white/[0.08]"
                }`}
              >
                <div className="font-black text-xl">{day.label}</div>

                <div
                  className={`mt-1 text-sm ${
                    active ? "text-black/60" : "text-white/45"
                  }`}
                >
                  {day.dayName} • {day.shortDate}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
            <div>
              <h2 className="font-black text-xl">{activeDay.label}</h2>
              <p className="text-white/45 text-sm">{activeDay.value}</p>
            </div>

            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
              {schedule.length} Shows
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-white/50">
              Loading schedule...
            </div>
          ) : schedule.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-2xl font-black mb-2">No schedule data</h3>
              <p className="text-white/45">
                Backend schedule is currently disabled to reduce AniList rate
                limits.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {schedule.map((item, index) => {
                const title = item.title || item.name || "Anime";
                const episode = item.episode || item.nextEpisode || "N/A";
                const time = item.time || item.airingAt || "Time N/A";

                return (
                  <Link
                    key={item.id || index}
                    to={item.id ? `/${item.slug || item.id}` : "/schedule"}
                    className="flex items-center justify-between gap-4 p-5 hover:bg-white/[0.05] transition"
                  >
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg line-clamp-1">
                        {title}
                      </h3>

                      <p className="text-white/45 text-sm mt-1">
                        Episode {episode}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm text-white/70">
                      {time}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
