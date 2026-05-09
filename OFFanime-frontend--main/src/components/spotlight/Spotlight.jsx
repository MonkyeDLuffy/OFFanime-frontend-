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
    <section className="relative w-screen h-[790px] max-[1400px]:h-[720px] max-[1024px]:h-[620px] max-md:h-[500px] -mt-16 left-1/2 -translate-x-1/2 overflow-hidden">
      {spotlights.length > 0 ? (
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          allowTouchMove={true}
          grabCursor={true}
          navigation={{
            nextEl: ".button-next",
            prevEl: ".button-prev",
          }}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
          }}
          modules={[Navigation, Autoplay, Pagination]}
          className="spotlight-swiper h-full w-full overflow-hidden relative"
          style={{
            "--swiper-pagination-bullet-inactive-color":
              "rgba(255, 255, 255, 0.45)",
            "--swiper-pagination-bullet-inactive-opacity": "1",
          }}
        >
          <div className="absolute right-[52px] top-[120px] flex space-x-3 z-[20] max-md:hidden">
            <div className="button-prev"></div>
            <div className="button-next"></div>
          </div>

          {spotlights.map((item, index) => (
            <SwiperSlide className="relative h-full" key={item.id || index}>
              <Banner item={item} index={index} spotlightFull />
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
