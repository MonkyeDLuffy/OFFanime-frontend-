import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faRandom,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import getSearch from "@/src/utils/getSearch.utils";
import { createAnimeSlug } from "@/src/utils/slug.utils";
import Sidebar from "../sidebar/Sidebar";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const inputRef = useRef(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const isSplashScreen = location.pathname === "/";

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();

    const closeOnEsc = (e) => {
      if (e.key === "Escape") closeSearch();
    };

    window.addEventListener("keydown", closeOnEsc);
    return () => window.removeEventListener("keydown", closeOnEsc);
  }, [searchOpen]);

  useEffect(() => {
    const keyword = search.trim();

    if (keyword.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await getSearch(keyword, 1);
        setSuggestions(Array.isArray(results) ? results.slice(0, 10) : []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch("");
    setSuggestions([]);
  };

  const goToSearchPage = () => {
    const value = search.trim();
    if (!value) return;

    closeSearch();
    navigate(`/search?keyword=${encodeURIComponent(value)}`);
  };

  const openAnime = (item) => {
    const id = item?.id || item?.anilistId;
    const title = item?.title || item?.name || item?.animeTitle || "anime";

    if (!id) return;

    closeSearch();
    navigate(`/${createAnimeSlug(title, id)}`);
  };

  if (isSplashScreen) return null;

  return (
    <>
      <nav className="fixed top-4 left-0 w-full z-[9999] pointer-events-none">
        <div className="max-w-[980px] mx-auto px-4 pointer-events-auto">
          <div className="h-[48px] rounded-full bg-black/75 border border-white/10 shadow-[0_10px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-300 hover:text-white transition lg:hidden"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>

              <Link
                to="/home"
                className="text-white text-[23px] font-black tracking-tight leading-none"
              >
                OFF
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-7 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
              <Link to="/home" className="hover:text-white transition">
                Home
              </Link>
              <Link to="/recently-updated" className="hover:text-white transition">
                Latest
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition"
              >
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </button>

              <Link
                to="/random"
                className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/15 transition"
              >
                <FontAwesomeIcon icon={faRandom} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl overflow-y-auto">
          <div className="min-h-screen px-4 pt-32 pb-16">
            <div className="max-w-[760px] mx-auto">
              <div className="h-[64px] rounded-2xl bg-[#090909]/95 border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] flex items-center px-5">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="text-gray-500 mr-4 text-lg"
                />

                <input
                  ref={inputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToSearchPage();
                  }}
                  placeholder="Search anime..."
                  className="w-full bg-transparent outline-none text-white text-xl"
                />

                <button
                  onClick={closeSearch}
                  className="ml-3 px-3 py-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-bold"
                >
                  ESC
                </button>
              </div>

              <div className="mt-8 space-y-2">
                {suggestions.map((item) => {
                  const id = item.id || item.anilistId;
                  const title = item.title || item.name || "Anime";
                  const poster = item.poster || item.image;
                  const banner = item.banner || item.bannerImage || item.image || poster;
                  const type = item.type || "TV";
                  const year = item.year || item.releaseDate || "?";
                  const eps = item.episodes || item.totalEpisodes || "?";

                  return (
                    <button
                      key={id}
                      onClick={() => openAnime(item)}
                      className="relative w-full h-[92px] overflow-hidden rounded-xl border border-white/10 bg-[#111] text-left hover:border-white/25 transition group"
                    >
                      {banner && (
                        <img
                          src={banner}
                          alt={title}
                          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 transition"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/30" />

                      <div className="relative z-10 h-full flex items-center gap-4 px-4">
                        <img
                          src={poster}
                          alt={title}
                          className="w-[52px] h-[70px] rounded-lg object-cover"
                        />

                        <div className="min-w-0">
                          <p className="text-white font-bold text-base line-clamp-1">
                            {title}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {type} • {year} • {eps} eps
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {search.trim().length >= 2 && suggestions.length === 0 && (
                  <div className="text-center text-gray-500 py-10">
                    No results found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}

export default Navbar;
