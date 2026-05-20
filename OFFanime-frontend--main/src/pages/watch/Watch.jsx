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

const ANIMEPAHE_API = "https://anime-streaming-system-1.onrender.com";
const EPISODES_PER_RANGE = 100;

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
    id: "animepahe-sub",
    name: "AnimePahe",
    provider: "animepahe",
    type: "sub",
  });

  const [selectedQuality, setSelectedQuality] = useState("720p");

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
  const [rangeOpen, setRangeOpen] = useState(false);

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

    if (correctRangeIndex !== -1 && correctRangeIndex !== episodeRange) {
      setEpisodeRange(correctRangeIndex);
    }
  }, [episode, ranges, episodeRange]);

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

      try {
        const [animeRes, episodeRes, serverRes] = await Promise.all([
          fetchAnimeInfo(animeId),
          getEpisodes(animeId),
          getServers(),
        ]);

        if (!alive) return;

        const cleanAnime =
          animeRes?.results ||
          animeRes?.data ||
          animeRes?.anime ||
          animeRes ||
          null;

        const cleanEpisodes = Array.isArray(episodeRes)
          ? episodeRes
          : episodeRes?.results || episodeRes?.episodes || [];

        setAnime(cleanAnime);
        setEpisodes(Array.isArray(cleanEpisodes) ? cleanEpisodes : []);

        const fallbackServers = [
          { id: "megaplay-sub", name: "MegaPlay", provider: "megaplay", type: "sub" },
          { id: "megaplay-dub", name: "MegaPlay", provider: "megaplay", type: "dub" },
          { id: "animepahe-sub", name: "AnimePahe", provider: "animepahe", type: "sub" },
          { id: "animepahe-dub", name: "AnimePahe", provider: "animepahe", type: "dub" },
        ];

        setServers(
          Array.isArray(serverRes) && serverRes.length
            ? serverRes
            : fallbackServers
        );
      } catch (err) {
        console.error("Watch page load error:", err);
        setAnime(null);
        setEpisodes([]);

        setServers([
          { id: "megaplay-sub", name: "MegaPlay", provider: "megaplay", type: "sub" },
          { id: "megaplay-dub", name: "MegaPlay", provider: "megaplay", type: "dub" },
          { id: "animepahe-sub", name: "AnimePahe", provider: "animepahe", type: "sub" },
          { id: "animepahe-dub", name: "AnimePahe", provider: "animepahe", type: "dub" },
        ]);
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

  async function loadAnimePaheStream() {
    const audio = selectedServer.type === "dub" ? "dub" : "sub";

    const res = await fetch(
      `${ANIMEPAHE_API}/watch?anilistId=${animeId}&ep=${episode}&audio=${audio}`
    );

    const json = await res.json();

    if (json?.error) {
      throw new Error(json.error);
    }

    return {
      provider: "animepahe",
      type: audio,
      raw: json,
    };
  }

  useEffect(() => {
    let alive = true;

    async function loadStream() {
      if (!animeId || !episode || loading) return;
      if (!allowPlayer) return;

      setStreamLoading(true);
      setIframeLoaded(false);
      setStream(null);

      try {
        let data;

        if (selectedServer.provider === "animepahe") {
          data = await loadAnimePaheStream();
        } else {
          data = await getStreamInfo(
            animeId,
            episode,
            selectedServer.provider,
            selectedServer.type,
            title
          );
        }

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
      (range) => Number(epNumber) >= range.start && Number(epNumber) <= range.end
    );

    if (correctRangeIndex !== -1) {
      setEpisodeRange(correctRangeIndex);
    }

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

  const animePaheQualitySections = useMemo(() => {
    if (stream?.provider !== "animepahe") return [];

    const audio = selectedServer.type === "dub";
    const allStreams =
      stream?.raw?.streams?.all || stream?.raw?.selected?.streams || [];

    const filtered = allStreams.filter((item) => {
      const isDub = item?.original?.isDub === true;
      return audio ? isDub : !isDub;
    });

    const qualityOrder = ["360p", "720p", "1080p"];

    return qualityOrder
      .map((quality) => {
        const found = filtered.find((x) => x.quality === quality);
        if (!found) return null;

        return {
          quality,
          label: `Kiwi-Stream-${quality}`,
          embed: found?.original?.embed,
          url: found?.url,
          rawUrl: found?.rawUrl,
          item: found,
        };
      })
      .filter(Boolean);
  }, [stream, selectedServer.type]);

  const selectedAnimePaheSource = useMemo(() => {
    if (stream?.provider !== "animepahe") return null;

    return (
      animePaheQualitySections.find((x) => x.quality === selectedQuality) ||
      animePaheQualitySections.find((x) => x.quality === "720p") ||
      animePaheQualitySections[0] ||
      null
    );
  }, [stream, animePaheQualitySections, selectedQuality]);

  const iframeUrl = useMemo(() => {
    if (stream?.provider === "animepahe") {
      const embed = selectedAnimePaheSource?.embed;
      if (!embed) return "";
      return `${embed}${embed.includes("?") ? "&" : "?"}reload=${reloadKey}`;
    }

    const normalUrl = stream?.url || stream?.embed || "";
    if (!normalUrl) return "";
    return `${normalUrl}${normalUrl.includes("?") ? "&" : "?"}reload=${reloadKey}`;
  }, [stream, selectedAnimePaheSource, reloadKey]);

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
                      To keep our servers running and provide high-quality streams,
                      please click the button below to support us. It takes only 3 seconds!
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
                  key={`${animeId}-${episode}-${selectedServer.id}-${selectedQuality}-${reloadKey}`}
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
                <p className="text-sm text-gray-400 mb-2">Servers</p>

                <div className="flex flex-wrap gap-3">
                  {servers.map((server) => {
                    const isActive = selectedServer.id === server.id;

                    return (
                      <button
                        key={server.id}
                        onClick={() => {
                          setSelectedServer(server);
                          setSelectedQuality("720p");
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

              {selectedServer.provider === "animepahe" && (
                <div className="mt-5">
                  <p className="text-sm text-gray-400 mb-2">
                    {selectedServer.type.toUpperCase()} Quality
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {animePaheQualitySections.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No AnimePahe quality found.
                      </p>
                    ) : (
                      animePaheQualitySections.map((section) => {
                        const isActive = selectedQuality === section.quality;

                        return (
                          <button
                            key={section.quality}
                            onClick={() => {
                              setSelectedQuality(section.quality);
                              setIframeLoaded(false);
                              setReloadKey((prev) => prev + 1);
                            }}
                            className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                              isActive
                                ? "bg-white text-black border-white"
                                : "bg-white/10 text-white border-white/10 hover:bg-white/15"
                            }`}
                          >
                            <FontAwesomeIcon icon={faPlay} className="mr-2 text-xs" />
                            {section.label}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden h-fit xl:sticky xl:top-24">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Episodes</h2>
                  <p className="text-sm text-gray-400">
                    {sortedEpisodes.length} episodes
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
                        {ranges[episodeRange]?.start}-{ranges[episodeRange]?.end}
                      </span>

                      <span className={`transition ${rangeOpen ? "rotate-180" : ""}`}>
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
              {visibleEpisodes.length === 0 ? (
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
