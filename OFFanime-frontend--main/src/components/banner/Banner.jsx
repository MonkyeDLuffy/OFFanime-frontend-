import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
  faCalendar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { createAnimeSlug } from "@/src/utils/slug.utils";
import { useLanguage } from "@/src/context/LanguageContext";
import getSafeTitle from "@/src/utils/getSafetitle";
import "./Banner.css";

function Banner({ item, index }) {
  const { language } = useLanguage();

  const title = getSafeTitle(item.title, language, item.japanese_title);

  const bannerImage =
    item.banner ||
    item.bannerImage ||
    item.cover ||
    item.image ||
    item.poster;

  return (
    <section className="spotlight w-full h-full relative rounded-xl overflow-hidden bg-black">
      {/* Soft blurred background layer */}
      <img
        src={bannerImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40"
        draggable="false"
      />

      {/* Sharp main image */}
      <img
        src={bannerImage}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
        draggable="false"
        loading="eager"
        style={{
          imageRendering: "auto",
          backfaceVisibility: "hidden",
          transform: "translateZ(0) scale(1.02)",
        }}
      />

      {/* Premium overlays */}
      <div className="absolute inset-0 bg-black/25 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-[1]" />

      <div className="absolute flex flex-col left-0 bottom-[42px] w-[58%] p-4 z-[2] max-[1390px]:w-[50%] max-[1300px]:w-[600px] max-[1120px]:w-[65%] max-md:w-[90%] max-md:bottom-[25px]">
        <p className="text-[#ffbade] font-semibold text-[20px] max-[1300px]:text-[15px]">
          #{index + 1} Spotlight
        </p>

        <h3 className="text-white line-clamp-2 text-5xl font-bold mt-4 text-left max-[1390px]:text-[45px] max-[1300px]:text-3xl max-md:text-2xl">
          {title}
        </h3>

        {/* Mobile Buttons */}
        <div className="hidden max-md:flex max-md:mt-3 max-md:gap-x-3">
          <Link
            to={`/watch/${createAnimeSlug(item.title || item.name, item.id)}?ep=1`}
            className="bg-white hover:bg-white/90 text-black font-medium px-5 py-1.5 rounded-lg flex items-center gap-x-2 text-sm"
          >
            <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
            <span>Watch Now</span>
          </Link>

          <Link
            to={`/${createAnimeSlug(item.title || item.name, item.id)}`}
            className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium px-5 py-1.5 rounded-lg text-sm"
          >
            Details
          </Link>
        </div>

        {item.tvInfo && (
          <div className="flex h-fit justify-start items-center w-fit space-x-5 mt-5 max-[1300px]:mt-4 max-md:hidden">
            {item.tvInfo.showType && (
              <div className="flex space-x-1 justify-center items-center">
                <FontAwesomeIcon
                  icon={faPlay}
                  className="text-[8px] bg-white/10 text-white px-[4px] py-[3px] rounded-full"
                />
                <p className="text-white/75 text-[16px]">
                  {item.tvInfo.showType}
                </p>
              </div>
            )}

            {item.tvInfo.duration && (
              <div className="flex space-x-1 justify-center items-center">
                <FontAwesomeIcon icon={faClock} className="text-white/75 text-[14px]" />
                <p className="text-white/75 text-[17px]">{item.tvInfo.duration}</p>
              </div>
            )}

            {item.tvInfo.releaseDate && (
              <div className="flex space-x-1 justify-center items-center">
                <FontAwesomeIcon icon={faCalendar} className="text-white/75 text-[14px]" />
                <p className="text-white/75 text-[16px]">{item.tvInfo.releaseDate}</p>
              </div>
            )}

            <div className="flex space-x-3 w-fit">
              {item.tvInfo.quality && (
                <div className="bg-white/10 py-[1px] px-[6px] rounded-md text-[11px] font-bold text-white">
                  {item.tvInfo.quality}
                </div>
              )}

              <div className="flex space-x-[1px] rounded-md overflow-hidden">
                {item.tvInfo.episodeInfo?.sub && (
                  <div className="flex space-x-1 items-center bg-white/10 px-[4px]">
                    <FontAwesomeIcon icon={faClosedCaptioning} className="text-[12px] text-white" />
                    <p className="text-[12px] font-bold text-white">
                      {item.tvInfo.episodeInfo.sub}
                    </p>
                  </div>
                )}

                {item.tvInfo.episodeInfo?.dub && (
                  <div className="flex space-x-1 items-center bg-white/20 px-[4px]">
                    <FontAwesomeIcon icon={faMicrophone} className="text-[12px] text-white" />
                    <p className="text-[12px] font-semibold text-white">
                      {item.tvInfo.episodeInfo.dub}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-white/75 text-[17px] mt-4 text-left line-clamp-3 max-[1200px]:line-clamp-2 max-[1300px]:w-[500px] max-[1120px]:w-[90%] max-md:hidden">
          {item.description}
        </p>
      </div>

      {/* Desktop Buttons */}
      <div className="absolute bottom-[50px] right-[40px] flex gap-x-5 z-[2] max-md:hidden">
        <Link
          to={`/watch/${createAnimeSlug(item.title || item.name, item.id)}`}
          className="bg-white hover:bg-white/90 text-black font-medium px-7 py-2 rounded-lg flex items-center gap-x-2.5 shadow-lg backdrop-blur-sm hover:-translate-y-[1px] transition"
        >
          <FontAwesomeIcon icon={faPlay} className="text-[10px]" />
          <span>Watch Now</span>
        </Link>

        <Link
          to={`/${createAnimeSlug(item.title || item.name, item.id)}`}
          className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white font-medium px-7 py-2 rounded-lg backdrop-blur-sm hover:-translate-y-[1px] transition"
        >
          Details
        </Link>
      </div>
    </section>
  );
}

export default Banner;
