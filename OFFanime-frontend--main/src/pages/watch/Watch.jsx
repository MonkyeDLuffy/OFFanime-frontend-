import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faClosedCaptioning,
  faMicrophone,
  faPlay,
  faRotateRight,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

import fetchAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getEpisodes from "@/src/utils/getEpisodes.utils";
import getServers from "@/src/utils/getServers.utils";
import getStreamInfo from "@/src/utils/getStreamInfo.utils";
import { createAnimeSlug, getAnimeIdFromSlug } from "@/src/utils/slug.utils";

export default function Watch() {
  const { id: animeSlug } = useParams();
  const animeId = getAnimeIdFromSlug(animeSlug);

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const initialEp = query.get("ep") || "1";
  const SUPPORT_COOLDOWN = 40 * 60 * 1000;

  const [anime, setAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episode, setEpisode] = useState(initialEp);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState({
    id: "megaplay-sub",
    name: "MegaPlay",
    provider: "megaplay",
    type: "sub",
  });

  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamLoading, setStreamLoading] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [episodeRange, setEpisodeRange] = useState(0);

  const [showSupportLayer, setShowSupportLayer] = useState(false);
  const [supportCountdown, setSupportCountdown] = useState(3);
  const [supportClicked, setSupportClicked] = useState(false);
  const [allowPlayer, setAllowPlayer] = useState(false);

  const title =
    anime?.title ||
    anime?.name ||
    anime?.animeTitle ||
    anime?.englishTitle ||
    anime?.romajiTitle ||
    "Anime";

  const correctSlug = anime
    ? createAnimeSlug(title, anime.id || animeId)
    : animeSlug;

  useEffect(() => {
  if (!anime || !episode) return;

  const saved =
    JSON.parse(localStorage.getItem("continueWatching")) || [];

  const item = {
    id: anime.id || animeId,
    title,
    poster:
      anime.poster ||
      anime.image ||
      anime.coverImage?.extraLarge ||
      anime.coverImage?.large ||
      anime.coverImage ||
      "",
    episode,
    currentTime: 1,
    duration: 100,
    updatedAt: Date.now(),
  };

  const filtered = saved.filter(
    (x) =>
      String(x.id) !== String(item.id) ||
      String(x.episode) !== String(item.episode)
  );

  localStorage.setItem(
    "continueWatching",
    JSON.stringify([item, ...filtered].slice(0, 12))
  );
}, [anime, animeId, episode, title]);

  useEffect(() => {
    if (!query.get("ep")) {
      navigate(`/watch/${animeSlug}?ep=1`, { replace: true });
    }
  }, [animeSlug, location.search, navigate]);

  useEffect(() => {
    let alive = true;

    async function loadPage() {
      setLoading(true);

      try {
        const [animeRes, episodeRes, serverRes] = await Promise.all([
          fetchAnimeInfo(animeId),
          getEpisodes(animeId),
          getServers(),
        ]);

        if (!alive) return;

        const cleanAnime =
          animeRes?.results || animeRes?.data || animeRes?.anime || animeRes || null;

        const cleanEpisodes = Array.isArray(episodeRes)
          ? episodeRes
          : episodeRes?.results || [];

        setAnime(cleanAnime);
        setEpisodes(Array.isArray(cleanEpisodes) ? cleanEpisodes : []);
        setServers(Array.isArray(serverRes) ? serverRes : []);
      } catch (err) {
        console.error("Watch page load error:", err);
        setAnime(null);
        setEpisodes([]);

        try {
          const fallbackServers = await getServers();
          setServers(Array.isArray(fallbackServers) ? fallbackServers : []);
        } catch {
          setServers([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (animeId) loadPage();

    return () => {
      alive = false;
    };
  }, [animeId]);

  useEffect(() => {
    if (!anime) return;

    const currentEp = query.get("ep") || "1";

    if (animeSlug !== correctSlug) {
      navigate(`/watch/${correctSlug}?ep=${currentEp}`, { replace: true });
    }
  }, [anime, animeSlug, correctSlug, location.search, navigate]);

  const shouldShowSupportLayer = () => {
    const lastShown = Number(localStorage.getItem("supportLayerLastShown") || 0);
    return Date.now() - lastShown > SUPPORT_COOLDOWN;
  };

  const handleSupportContinue = () => {
    if (supportClicked) return;

    setSupportClicked(true);
    setSupportCountdown(3);

    const timer = setInterval(() => {
      setSupportCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.setItem("supportLayerLastShown", String(Date.now()));
          setShowSupportLayer(false);
          setAllowPlayer(true);
          setSupportClicked(false);
          setSupportCountdown(3);
          return 3;
        }

        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!loading) {
      if (shouldShowSupportLayer()) {
        setAllowPlayer(false);
        setShowSupportLayer(true);
      } else {
        setAllowPlayer(true);
        setShowSupportLayer(false);
      }
    }
  }, [loading, animeId, episode]);

  useEffect(() => {
    let alive = true;

    async function loadStream() {
      if (!animeId || !episode || loading) return;
      if (!allowPlayer) return;

      setStreamLoading(true);
      setIframeLoaded(false);
      setStream(null);

      try {
        const data = await getStreamInfo(
          animeId,
          episode,
          selectedServer.provider,
          selectedServer.type,
          title
        );

        if (!alive) return;

        setStream(data);
        setReloadKey((prev) => prev + 1);
        navigate(`/watch/${correctSlug}?ep=${episode}`, { replace: true });
      } catch (err) {
        console.error("Stream load error:", err);
        setStream(null);
      } finally {
        if (alive) setStreamLoading(false);
      }
    }

    loadStream();

    return () => {
      alive = false;
    };
  }, [
    animeId,
    episode,
    selectedServer,
    title,
    loading,
    allowPlayer,
    correctSlug,
    navigate,
  ]);

  const forceReloadPlayer = () => {
    setIframeLoaded(false);
    setReloadKey((prev) => prev + 1);
  };

  const getEpisodeNumber = (ep) =>
    ep?.number || ep?.episodeId || ep?.episode_no || ep?.episode || "1";

  const ranges = useMemo(() => {
    const total = episodes.length;
    const arr = [];

    for (let i = 0; i < total; i += 100) {
      arr.push({
        start: i + 1,
        end: Math.min(i + 100, total),
      });
    }

    return arr;
  }, [episodes]);

  const visibleEpisodes = useMemo(() => {
    const range = ranges[episodeRange];
    if (!range) return episodes;
    return episodes.slice(range.start - 1, range.end);
  }, [episodes, ranges, episodeRange]);

  const currentIndex = episodes.findIndex(
    (ep) => String(getEpisodeNumber(ep)) === String(episode)
  );

  const goToEpisode = (ep) => {
    const epNumber = String(getEpisodeNumber(ep));

    setEpisode(epNumber);
    setReloadKey((prev) => prev + 1);
    setStream(null);
    setIframeLoaded(false);

    navigate(`/watch/${correctSlug}?ep=${epNumber}`, { replace: true });

    if (shouldShowSupportLayer()) {
      setAllowPlayer(false);
      setShowSupportLayer(true);
    } else {
      setAllowPlayer(true);
      setShowSupportLayer(false);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    if (currentIndex > 0) goToEpisode(episodes[currentIndex - 1]);
  };

  const goNext = () => {
    if (currentIndex >= 0 && episodes[currentIndex + 1]) {
      goToEpisode(episodes[currentIndex + 1]);
    }
  };

  const iframeUrl = stream?.url
    ? `${stream.url}${stream.url.includes("?") ? "&" : "?"}reload=${reloadKey}`
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white pt-28 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-20 pb-16">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 lg:px-8">
        <div className="mb-5">
          <Link
            to={`/${correctSlug}`}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to details
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <div className="space-y-5">
            <div className="relative w-full h-[430px] sm:h-auto sm:aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              {showSupportLayer && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md px-4 py-6 overflow-y-auto">
                  <div className="w-full max-w-[520px] text-center my-auto">
                    <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white text-black shadow-2xl">
                      <FontAwesomeIcon icon={faHeart} className="text-lg sm:text-xl" />
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-5 leading-tight">
                      Support Our Site
                    </h2>

                    <p className="text-gray-400 text-sm sm:text-lg leading-relaxed mb-6 sm:mb-10 max-w-[440px] mx-auto">
                      To keep our servers running and provide high-quality
                      streams, please click the button below to support us. It
                      takes only 3 seconds!
                    </p>

                    <button
                      onClick={() => {
                        window.open(
                          "https://www.profitablecpmratenetwork.com/zr01hhkca7?key=7be31ab1b7945153e6f435dbad0aabef",
                          "_blank"
                        );
                        handleSupportContinue();
                      }}
                      disabled={supportClicked}
                      className="w-full max-w-[320px] sm:max-w-[350px] mx-auto rounded-full bg-white text-black font-extrabold py-4 sm:py-5 text-sm sm:text-lg tracking-wide hover:bg-gray-200 transition disabled:opacity-80 shadow-xl"
                    >
                      {supportClicked
                        ? `LOADING IN ${supportCountdown}...`
                        : "SUPPORT & CONTINUE"}
                    </button>

                    <p className="mt-4 text-[11px] sm:text-xs text-gray-600">
                      Player will unlock automatically after countdown.
                    </p>
                  </div>
                </div>
              )}

              {!showSupportLayer && (streamLoading || !iframeLoaded) && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black text-white gap-3">
                  <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-sm text-gray-300">Loading player...</p>
                </div>
              )}

              {stream?.url && !showSupportLayer ? (
                <iframe
                  key={`${animeId}-${episode}-${selectedServer.id}-${reloadKey}`}
                  src={iframeUrl}
                  title={`${title} Episode ${episode}`}
                  className="w-full h-full bg-black"
                  allowFullScreen
                  scrolling="no"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  onLoad={() => setIframeLoaded(true)}
                />
              ) : (
                !streamLoading &&
                !showSupportLayer && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Stream not available.
                  </div>
                )
              )}

              {!showSupportLayer && (
                <button
                  onClick={forceReloadPlayer}
                  className="absolute top-3 right-3 z-30 bg-black/70 hover:bg-black text-white px-3 py-2 rounded-lg text-xs sm:text-sm"
                >
                  <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
                  Reload
                </button>
              )}
            </div>

            <div className="bg-[#121212] border border-white/10 rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
                  <p className="text-gray-400 mt-1">Episode {episode}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={goPrev}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15"
                  >
                    Prev
                  </button>

                  <button
                    onClick={goNext}
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm text-gray-400 mb-2">Servers</p>

                <div className="flex flex-wrap gap-3">
                  {servers.map((server) => {
                    const isActive = selectedServer.id === server.id;

                    return (
                      <button
                        key={server.id}
                        onClick={() => {
                          setSelectedServer(server);
                          setReloadKey((prev) => prev + 1);
                          setStream(null);
                          setIframeLoaded(false);

                          if (shouldShowSupportLayer()) {
                            setAllowPlayer(false);
                            setShowSupportLayer(true);
                          } else {
                            setAllowPlayer(true);
                            setShowSupportLayer(false);
                          }
                        }}
                        className={`px-4 sm:px-5 py-2 rounded-xl border transition ${
                          isActive
                            ? "bg-white text-black border-white"
                            : "bg-white/10 text-white border-white/10 hover:bg-white/15"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            server.type === "dub"
                              ? faMicrophone
                              : faClosedCaptioning
                          }
                          className="mr-2"
                        />
                        {server.name} {server.type.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <aside className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden h-fit xl:sticky xl:top-24">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Episodes</h2>
                  <p className="text-sm text-gray-400">
                    {episodes.length} episodes
                  </p>
                </div>

                {ranges.length > 1 && (
                  <select
                    value={episodeRange}
                    onChange={(e) => setEpisodeRange(Number(e.target.value))}
                    className="bg-[#1b1b1b] border border-white/10 rounded-xl px-3 py-2 text-sm"
                  >
                    {ranges.map((range, index) => (
                      <option key={index} value={index}>
                        {range.start}-{range.end}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="max-h-[720px] overflow-y-auto p-4 grid grid-cols-3 gap-2">
              {visibleEpisodes.length === 0 ? (
                <p className="text-gray-400 col-span-3">No episodes found.</p>
              ) : (
                visibleEpisodes.map((ep) => {
                  const epNumber = getEpisodeNumber(ep);

                  return (
                    <button
                      key={ep.id || epNumber}
                      onClick={() => goToEpisode(ep)}
                      className={`h-12 rounded-xl border font-semibold transition ${
                        String(epNumber) === String(episode)
                          ? "bg-white text-black border-white"
                          : "bg-[#1b1b1b] text-white border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={faPlay}
                        className="text-[10px] mr-2"
                      />
                      {epNumber}
                    </button>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
