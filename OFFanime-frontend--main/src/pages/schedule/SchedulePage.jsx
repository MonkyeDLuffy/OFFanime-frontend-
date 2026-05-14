import { useEffect, useState } from "react";

const API = "https://anime-details-api.onrender.com";

function getDateLabel(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return {
    date,
    label:
      offset === 0
        ? "Today"
        : offset === 1
        ? "Tomorrow"
        : "Day After Tomorrow",
    value: date.toISOString().split("T")[0],
  };
}

export default function SchedulePage() {
  const days = [getDateLabel(0), getDateLabel(1), getDateLabel(2)];
  const [activeDay, setActiveDay] = useState(days[0]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);

      try {
        const res = await fetch(`${API}/api/schedule?date=${activeDay.value}`);
        const json = await res.json();

        setSchedule(json?.results || []);
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
        <h1 className="text-3xl sm:text-5xl font-black mb-3">
          Anime Schedule
        </h1>

        <p className="text-white/50 mb-8">
          Showing only today, tomorrow, and day after tomorrow to reduce API load.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {days.map((day) => {
            const active = activeDay.value === day.value;

            return (
              <button
                key={day.value}
                onClick={() => setActiveDay(day)}
                className={`rounded-2xl px-5 py-5 border text-left transition ${
                  active
                    ? "bg-white text-black border-white"
                    : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="font-bold text-lg">{day.label}</div>
                <div className={active ? "text-black/60" : "text-white/50"}>
                  {day.value}
                </div>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-white/50">Loading schedule...</div>
        ) : schedule.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/50">
            No schedule data found.
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div>
                  <h2 className="font-bold text-lg">
                    {item.title || item.name || "Anime"}
                  </h2>
                  <p className="text-white/50 text-sm">
                    Episode {item.episode || item.nextEpisode || "N/A"}
                  </p>
                </div>

                <div className="text-white/60 text-sm">
                  {item.time || item.airingAt || "Time N/A"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}