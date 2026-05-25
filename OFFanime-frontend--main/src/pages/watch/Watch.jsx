import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faClosedCaptioning,
  faPlay,
  faRotateRight,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";

import fetchAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getEpisodes from "@/src/utils/getEpisodes.utils";
import getStreamInfo from "@/src/utils/getStreamInfo.utils";
import { createAnimeSlug, getAnimeIdFromSlug } from "@/src/utils/slug.utils";

const EPISODES_PER_RANGE = 100;

const DEFAULT_SERVERS = [
  {
    id: "server-1",
    name: "Server 1",
    provider: "megaplay-anilist",
    type: "sub",
  },
  {
    id: "server-2",
    name: "Server 2",
    provider: "megaplay-mal",
    type: "sub",
  },
];

function PremiumBannerAd() {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;

    adRef.current.innerHTML = "";

    window.atOptions = {
      key: "fa18fe18755cc0b110e4155f955a4c3e",
      format: "iframe",
      height: 50,
      width: 320,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/fa18fe18755cc0b110e4155f955a4c3e/invoke.js";
    script.async = true;

    adRef.current.appendChild(script);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#111111] via-[#161616] to-[#0b0b0b] shadow-[0_0_25px_rgba(255,255,255,0.04)] backdrop-blur-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 font-semibold">
          Sponsored
        </span>

        <span className="text-[10px] text-zinc-500">
          Support OFFANIME
        </span>
      </div>

      <div
        ref={adRef}
        className="w-[320px] h-[50px] max-w-full overflow-hidden rounded-xl border border-white/5 bg-black/40 mx-auto"
      />
    </div>
  );
}

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
  const [episodesLoading, setEpisodesLoading] = useState(true);
  const [episode, setEpisode] = useState(initialEp);
  const [servers] = useState(DEFAULT_SERVERS);
  const [selectedServer, setSelectedServer] = useState(DEFAULT_SERVERS[0]);

  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamLoading, setStreamLoading] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [episodeRange, setEpisodeRange] = useState(0);
  const [rangeOpen, setRangeOpen] = useState(false);

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

  const finalMalId =
    anime?.malId ||
    anime?.malID ||
    anime?.mal_id ||
    anime?.idMal ||
    anime?.mappings?.mal ||
    anime?.mappings?.malId ||
    anime?.externalIds?.mal ||
    anime?.externalIds?.malId ||
    anime?.ids?.mal ||
    anime?.ids?.malId ||
    null;

  const getEpisodeNumber = (ep) => {
    const n =
      ep?.number ||
      ep?.episodeNumber ||
      ep?.episode_no ||
      ep?.episode ||
      ep?.ep ||
      "1";

    return Number(String(n).replace(/\D/g, "")) || 1;
  };

  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort(
      (a, b) => getEpisodeNumber(a) - getEpisodeNumber(b)
    );
  }, [episodes]);

  const ranges = useMemo(() => {
    if (!sortedEpisodes.length) return [];

    const maxEp = Math.max(...sortedEpisodes.map(getEpisodeNumber));
    const totalRanges = Math.ceil(maxEp / EPISODES_PER_RANGE);

    return Array.from({ length: totalRanges }, (_, index) => {
      const start = index * EPISODES_PER_RANGE + 1;
      const end = Math.min((index + 1) * EPISODES_PER_RANGE, maxEp);
      return { start, end };
    });
  }, [sortedEpisodes]);

  const visibleEpisodes = useMemo(() => {
    const range = ranges[episodeRange];
    if (!range) return sortedEpisodes;

    return sortedEpisodes.filter((ep) => {
      const epNumber = getEpisodeNumber(ep);
      return epNumber >= range.start && epNumber <= range.end;
    });
  }, [sortedEpisodes, ranges, episodeRange]);

  useEffect(() => {
    if (!ranges.length || !episode) return;

    const epNum = Number(episode);
    const correctRangeIndex = ranges.findIndex(
      (range) => epNum >= range.start && epNum <= range.end
    );

    if (correctRangeIndex !== -1) {
      setEpisodeRange(correctRangeIndex);
    }
  }, [episode, ranges]);

  useEffect(() => {
    if (!anime || !episode) return;

    const saved = JSON.parse(localStorage.getItem("continueWatching")) || [];

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
    } else {
      setEpisode(query.get("ep"));
    }
  }, [animeSlug, location.search, navigate]);

  useEffect(() => {
    let alive = true;

    async function loadPage() {
      setLoading(true);
      setEpisodes([]);
      setEpisodesLoading(true);

      try {
        const animeRes = await fetchAnimeInfo(animeId);

        if (!alive) return;

        const cleanAnime =
          animeRes?.results ||
          animeRes?.data ||
          animeRes?.anime ||
          animeRes ||
          null;

        setAnime(cleanAnime);
        setLoading(false);

        getEpisodes(animeId)
          .then((episodeRes) => {
            if (!alive) return;

            const cleanEpisodes = Array.isArray(episodeRes)
              ? episodeRes
              : episodeRes?.results || episodeRes?.episodes || [];

            setEpisodes(Array.isArray(cleanEpisodes) ? cleanEpisodes : []);
          })
          .catch((err) => {
            console.error("Episodes load error:", err);
            if (alive) setEpisodes([]);
          })
          .finally(() => {
            if (alive) setEpisodesLoading(false);
          });
      } catch (err) {
        console.error("Watch page load error:", err);

        if (!alive) return;

        setAnime(null);
        setEpisodes([]);
        setEpisodesLoading(false);
        setLoading(false);
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
  let failTimer = null;

  async function loadStream() {
    if (!animeId || !episode || loading || !anime) return;
    if (!allowPlayer) return;

    setStreamLoading(true);
    setIframeLoaded(false);
    setStream(null);

    try {
      const streamId =
        selectedServer.provider === "megaplay-mal"
          ? finalMalId || animeId
          : animeId;

      const data = await getStreamInfo(
        streamId,
        episode,
        selectedServer.provider,
        selectedServer.type,
        title
      );

      if (!alive) return;

      setStream(data);
      setReloadKey((prev) => prev + 1);
      navigate(`/watch/${correctSlug}?ep=${episode}`, { replace: true });

      failTimer = setTimeout(() => {
        const iframe = document.querySelector("iframe");

        if (!alive) return;

        if (!iframe) {
          setSelectedServer((prev) =>
            prev.provider === "megaplay-anilist"
              ? DEFAULT_SERVERS[1]
              : DEFAULT_SERVERS[0]
          );
        }
      }, 8000);
    } catch (err) {
      console.error("Stream load error:", err);

      if (!alive) return;

      setSelectedServer((prev) =>
        prev.provider === "megaplay-anilist"
          ? DEFAULT_SERVERS[1]
          : DEFAULT_SERVERS[0]
      );
    } finally {
      if (alive) setStreamLoading(false);
    }
  }

  loadStream();

  return () => {
    alive = false;
    if (failTimer) clearTimeout(failTimer);
  };
}, [
  anime,
  animeId,
  finalMalId,
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

  const currentIndex = sortedEpisodes.findIndex(
    (ep) => String(getEpisodeNumber(ep)) === String(episode)
  );

  const goToEpisode = (ep) => {
    const epNumber = String(getEpisodeNumber(ep));

    setEpisode(epNumber);
    setReloadKey((prev) => prev + 1);
    setStream(null);
    setIframeLoaded(false);

    const correctRangeIndex = ranges.findIndex(
      (range) =>
        Number(epNumber) >= range.start && Number(epNumber) <= range.end
    );

    if (correctRangeIndex !== -1) setEpisodeRange(correctRangeIndex);

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
    if (currentIndex > 0) goToEpisode(sortedEpisodes[currentIndex - 1]);
  };

  const goNext = () => {
    if (currentIndex >= 0 && sortedEpisodes[currentIndex + 1]) {
      goToEpisode(sortedEpisodes[currentIndex + 1]);
    }
  };

  const iframeUrl = useMemo(() => {
    const normalUrl = stream?.url || stream?.embed || "";
    if (!normalUrl) return "";
    return `${normalUrl}${normalUrl.includes("?") ? "&" : "?"}reload=${reloadKey}`;
  }, [stream, reloadKey]);

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
                      <FontAwesomeIcon
                        icon={faHeart}
                        className="text-lg sm:text-xl"
                      />
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

              {iframeUrl && !showSupportLayer ? (
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
                    disabled={currentIndex <= 0}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40"
                  >
                    Prev
                  </button>

                  <button
                    onClick={goNext}
                    disabled={!sortedEpisodes[currentIndex + 1]}
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="mt-5">
  <p className="text-sm text-gray-400 mb-3">Playback</p>

  <div className="flex flex-wrap items-end gap-4">
    {/* Servers */}
    <div>
      <p className="text-xs text-gray-500 mb-2">Servers</p>

      <div className="flex flex-wrap gap-3">
        {servers.map((server) => {
          const isActive = selectedServer.id === server.id;

          return (
            <button
              key={server.id}
              onClick={() => {
                setSelectedServer((prev) => ({
                  ...server,
                  type: prev.type,
                }));

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
              <FontAwesomeIcon icon={faClosedCaptioning} className="mr-2" />
              {server.name}
            </button>
          );
        })}
      </div>
    </div>

    {/* Audio */}
    <div>
      <p className="text-xs text-gray-500 mb-2">Audio</p>

      <div className="flex flex-wrap gap-3">
        {["sub", "dub"].map((audioType) => (
          <button
            key={audioType}
            onClick={() => {
              setSelectedServer((prev) => ({
                ...prev,
                type: audioType,
              }));

              setReloadKey((prev) => prev + 1);
              setStream(null);
              setIframeLoaded(false);
            }}
            className={`px-4 sm:px-5 py-2 rounded-xl border transition ${
              selectedServer.type === audioType
                ? "bg-white text-black border-white"
                : "bg-white/10 text-white border-white/10 hover:bg-white/15"
            }`}
          >
            {audioType.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  </div>
</div>

        

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PremiumBannerAd />
              <PremiumBannerAd />
            </div>
          </div>

          <aside className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden h-fit xl:sticky xl:top-24">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Episodes</h2>
                  <p className="text-sm text-gray-400">
                    {episodesLoading
                      ? "Loading episodes..."
                      : `${sortedEpisodes.length} episodes`}
                  </p>
                </div>

                {ranges.length >= 1 && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRangeOpen((prev) => !prev)}
                      className="min-w-[120px] flex items-center justify-between gap-3 bg-[#1b1b1b] border border-white/10 hover:border-white/25 hover:bg-white/10 rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
                    >
                      <span>
                        {ranges[episodeRange]?.start}-
                        {ranges[episodeRange]?.end}
                      </span>

                      <span
                        className={`transition ${
                          rangeOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>

                    {rangeOpen && (
                      <div className="absolute right-0 top-full mt-2 w-[140px] bg-[#151515] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        {ranges.map((range, index) => {
                          const active = episodeRange === index;

                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setEpisodeRange(index);
                                setRangeOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 text-sm font-semibold transition ${
                                active
                                  ? "bg-white text-black"
                                  : "text-white hover:bg-white/10"
                              }`}
                            >
                              {range.start}-{range.end}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="max-h-[720px] overflow-y-auto p-4 grid grid-cols-3 gap-2">
              {episodesLoading ? (
                <p className="text-gray-400 col-span-3">
                  Loading episodes...
                </p>
              ) : visibleEpisodes.length === 0 ? (
                <p className="text-gray-400 col-span-3">No episodes found.</p>
              ) : (
                visibleEpisodes.map((ep) => {
                  const epNumber = getEpisodeNumber(ep);

                  return (
                    <button
                      key={ep.id || ep.episodeId || epNumber}
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
