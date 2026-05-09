import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Spotlight.css";
import Banner from "../banner/Banner";

const Spotlight = ({ spotlights = [] }) => {
  return (
    <section className="relative w-screen h-[700px] max-[1400px]:h-[650px] max-[1024px]:h-[560px] max-md:h-[470px] -mt-16 left-1/2 -translate-x-1/2 overflow-hidden">
      {spotlights.length > 0 ? (
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          allowTouchMove={true}
          grabCursor={true}
          navigation={{
            nextEl: ".spotlight-next",
            prevEl: ".spotlight-prev",
          }}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          modules={[Navigation, Autoplay, Pagination]}
          className="spotlight-swiper h-full w-full overflow-hidden relative"
        >
          <div className="absolute right-[38px] top-[145px] flex items-center gap-3 z-[30] max-md:hidden">
            <button className="spotlight-prev" aria-label="Previous slide">
              ‹
            </button>
            <button className="spotlight-next" aria-label="Next slide">
              ›
            </button>
          </div>

          {spotlights.map((item, index) => (
            <SwiperSlide className="relative h-full" key={item.id || index}>
              <div className="spotlight-slide-zoom h-full">
                <Banner item={item} index={index} spotlightFull />
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
