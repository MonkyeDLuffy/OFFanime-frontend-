import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getEpisodes from "@/src/utils/getEpisodes.utils";
import getRecommendations from "@/src/utils/getRecommendations.utils";
import getSeasons from "@/src/utils/getSeasons.utils";
import getJikanInfo from "@/src/utils/getJikanInfo.utils";
import getTmdbInfo from "@/src/utils/getTmdbInfo.utils";

import {
  createAnimeSlug,
  getAnimeIdFromSlug,
} from "@/src/utils/slug.utils";

import Hero from "./components/Hero";
import Seasons from "./components/Seasons";
import EpisodeGrid from "./components/EpisodeGrid";
import Recommendations from "./components/Recommendations";

const TABS = [
  { id: "episodes", label: "Episodes" },
  { id: "relations", label: "Relations" },
  { id: "recommendations", label: "Recommendations" },
];

export default function AnimeInfo() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  const id = useMemo(() => getAnimeIdFromSlug(routeId), [routeId]);

  const [anime, setAnime] = useState(null);
  const [jikanInfo, setJikanInfo] = useState(null);
  const [tmdbInfo, setTmdbInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("episodes");
  const [tabLoading, setTabLoading] = useState(false);

  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [loadedTabs, setLoadedTabs] = useState({
    episodes: false,
    relations: false,
    recommendations: false,
  });

  useEffect(() => {
    if (!id) {
      setAnime(null);
      setLoading(false);
      return;
    }

    let alive = true;

    async function loadMainInfo() {
      try {
        setLoading(true);

        setAnime(null);
        setJikanInfo(null);
        setTmdbInfo(null);
        setEpisodes([]);
        setSeasons([]);
        setRecommendations([]);

        setLoadedTabs({
          episodes: false,
          relations: false,
          recommendations: false,
        });

        setActiveTab("episodes");

        const animeRes = await getAnimeInfo(id);

        if (!alive) return;

        const animeData =
          animeRes?.data ||
          animeRes?.results ||
          animeRes?.anime ||
          animeRes ||
          null;

        setAnime(animeData);

        getJikanInfo(id)
          .then((jikan) => {
            if (alive && jikan) setJikanInfo(jikan);
          })
          .catch((err) => {
            console.log("Failed to load Jikan:", err.message);
          });

        getTmdbInfo(id)
          .then((tmdb) => {
            if (alive && tmdb) setTmdbInfo(tmdb);
          })
          .catch((err) => {
            console.log("Failed to load TMDB:", err.message);
          });
      } catch (error) {
        console.error("AnimeInfo main load error:", error);

        if (alive) {
          setAnime(null);
          setJikanInfo(null);
          setTmdbInfo(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadMainInfo();

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!anime || !id || !routeId) return;

    const title =
      anime.title ||
      anime.name ||
      anime.animeTitle ||
      anime.englishTitle ||
      anime.romajiTitle ||
      jikanInfo?.titleEnglish ||
      jikanInfo?.title ||
      tmdbInfo?.title ||
      "anime";

    const correctSlug = createAnimeSlug(title, id);

    if (routeId !== correctSlug) {
      navigate(`/${correctSlug}`, { replace: true });
    }
  }, [anime, jikanInfo, tmdbInfo, id, routeId, navigate]);

  useEffect(() => {
    if (!anime || !id) return;
    if (loadedTabs[activeTab]) return;

    let alive = true;

    async function loadTab() {
      try {
        setTabLoading(true);

        if (activeTab === "episodes") {
          const res = await getEpisodes(id);
          const data = Array.isArray(res) ? res : res?.results || [];
          if (alive) setEpisodes(data);
        }

        if (activeTab === "relations") {
          const res = await getSeasons(id);
          const data = Array.isArray(res) ? res : res?.results || [];
          if (alive) setSeasons(data);
        }

        if (activeTab === "recommendations") {
          const res = await getRecommendations(id);
          const data = Array.isArray(res) ? res : res?.results || [];
          if (alive) setRecommendations(data);
        }

        if (alive) {
          setLoadedTabs((prev) => ({
            ...prev,
            [activeTab]: true,
          }));
        }
      } catch (error) {
        console.error(`${activeTab} tab load error:`, error);

        if (alive) {
          setLoadedTabs((prev) => ({
            ...prev,
            [activeTab]: true,
          }));
        }
      } finally {
        if (alive) setTabLoading(false);
      }
    }

    loadTab();

    return () => {
      alive = false;
    };
  }, [activeTab, anime, id, loadedTabs]);

  if (loading) {
    return <MainSkeleton />;
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">Anime Not Found</h1>
          <p className="text-gray-400">Failed to load anime information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen">
      <Hero anime={anime} jikanInfo={jikanInfo} tmdbInfo={tmdbInfo} />

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="mt-8 border-b border-white/10 flex gap-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm md:text-base font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "text-white border-b-2 border-white"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tabLoading ? (
            <TabSkeleton activeTab={activeTab} />
          ) : (
            <>
              {activeTab === "episodes" && (
                <EpisodeGrid
                  id={id}
                  anime={anime}
                  episodes={episodes}
                  tmdbInfo={tmdbInfo}
                />
              )}

              {activeTab === "relations" && <Seasons data={seasons} />}

              {activeTab === "recommendations" && (
                <Recommendations data={recommendations} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MainSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16">
      <div className="max-w-[1700px] mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#111] border border-white/10 min-h-[430px]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#151515] via-[#222] to-[#151515] opacity-70 animate-pulse" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 p-8 md:p-12">
            <div className="w-[230px] h-[330px] rounded-2xl bg-white/10 animate-pulse" />

            <div className="flex-1 max-w-[800px] space-y-5">
              <div className="h-14 w-[70%] rounded-xl bg-white/10 animate-pulse" />

              <div className="flex gap-3">
                <div className="h-8 w-20 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-8 w-24 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-8 w-20 rounded-lg bg-white/10 animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-[90%] rounded bg-white/10 animate-pulse" />
                <div className="h-4 w-[75%] rounded bg-white/10 animate-pulse" />
              </div>

              <div className="flex gap-3 pt-3">
                <div className="h-14 w-40 rounded-xl bg-white/10 animate-pulse" />
                <div className="h-14 w-32 rounded-xl bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <TabSkeleton activeTab="episodes" />
      </div>
    </div>
  );
}

function TabSkeleton({ activeTab }) {
  if (activeTab === "episodes") {
    return (
      <div>
        <div className="h-8 w-36 rounded bg-white/10 animate-pulse mb-5" />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[#141414] border border-white/10 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-8 w-48 rounded bg-white/10 animate-pulse mb-5" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-2xl bg-[#141414] border border-white/10 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
