import { Link } from "react-router-dom";

const Banner = ({ item, tmdbLogo }) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src={
            item?.banner ||
            item?.cover ||
            item?.image
          }
          alt={item?.title}
          className="w-full h-full object-cover scale-105"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 h-full flex items-center px-[55px] max-md:px-5">
        <div className="max-w-[850px] pt-16">
          {/* SPOTLIGHT TEXT */}
          <div className="text-[#ffbade] text-[22px] font-semibold mb-4">
            #{item?.rank || 1} Spotlight
          </div>

          {/* TMDB LOGO */}
          {tmdbLogo ? (
            <img
              src={tmdbLogo}
              alt={item?.title}
              className="max-w-[480px] max-h-[220px] object-contain mb-6 drop-shadow-[0_0_30px_rgba(0,0,0,0.95)] max-md:max-w-[260px]"
              loading="lazy"
            />
          ) : (
            <h1 className="text-white text-7xl font-black leading-[1.05] mb-6 max-w-[850px] max-md:text-5xl">
              {item?.title}
            </h1>
          )}

          {/* DESCRIPTION */}
          <p className="text-[#d7d7d7] text-[18px] leading-[1.8] max-w-[760px] line-clamp-3 mb-10 max-md:text-[15px]">
            {item?.description ||
              item?.overview ||
              "No description available."}
          </p>

          {/* BUTTONS */}
          <div className="flex items-center gap-5">
            <Link
              to={`/watch/${item?.id}?ep=1`}
              className="h-[64px] px-10 rounded-2xl bg-white text-black font-bold text-[20px] flex items-center justify-center hover:scale-105 duration-300"
            >
              ▶ Watch Now
            </Link>

            <Link
              to={`/${item?.id}`}
              className="h-[64px] px-10 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl text-white font-bold text-[20px] flex items-center justify-center hover:bg-white/20 duration-300"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
