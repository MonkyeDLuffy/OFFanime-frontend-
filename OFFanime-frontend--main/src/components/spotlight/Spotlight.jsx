import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, EffectFade } from "swiper/modules";
import { useEffect, useState } from "react";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import "./Spotlight.css";
import Banner from "../banner/Banner";

const API_URL = import.meta.env.VITE_API_URL;

const Spotlight = ({ spotlights = [] }) => {
  const [tmdbLogos, setTmdbLogos] = useState({});

  useEffect(() => {
    if (!spotlights.length) return;

    let alive = true;

    async function loadLogos() {
      const logos = {};

      await Promise.all(
        spotlights.slice(0, 12).map(async (anime) => {
          try {
            const res = await fetch(`${API_URL}/tmdb/${anime.id}`);
            const json = await res.json();

            if (json?.data?.logo) {
              logos[anime.id] = json.data.logo;
            }
          } catch (err) {
            console.log("Spotlight TMDB logo error:", err);
          }
        })
      );

      if (alive) setTmdbLogos(logos);
    }

    loadLogos();

    return () => {
      alive = false;
    };
  }, [spotlights]);

  return (
    <section className="relative w-screen h-[660px] max-[1400px]:h-[610px] max-[1024px]:h-[540px] max-md:h-[460px] -mt-16 left-1/2 -translate-x-1/2 overflow-hidden">
      {spotlights.length > 0 ? (
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          allowTouchMove={true}
          grabCursor={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1200}
          navigation={{
            nextEl: ".spotlight-next",
            prevEl: ".spotlight-prev",
          }}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 6500,
            disableOnInteraction: false,
          }}
          modules={[Navigation, Autoplay, Pagination, EffectFade]}
          className="spotlight-swiper h-full w-full overflow-hidden relative"
        >
          <div className="absolute right-[38px] top-[145px] flex items-center gap-3 z-[30] max-md:hidden">
            <button className="spotlight-prev">‹</button>
            <button className="spotlight-next">›</button>
          </div>

          {spotlights.map((item, index) => (
            <SwiperSlide className="relative h-full" key={item.id || index}>
              <div className="relative h-full w-full">
                <Banner item={item} index={index} />

                {tmdbLogos[item.id] && (
                  <img
                    src={tmdbLogos[item.id]}
                    alt={item.title}
                    className="absolute left-[55px] top-[250px] z-[40] max-w-[460px] max-h-[160px] object-contain drop-shadow-[0_0_35px_rgba(0,0,0,1)] max-md:left-5 max-md:top-[150px] max-md:max-w-[260px]"
                    loading="lazy"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="h-full flex items-center justify-center text-white">
          No spotlights to show.
        </div>
      )}
    </section>
  );
};

export default Spotlight;
