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
    <div className="relative h-[560px] max-[1390px]:h-[520px] max-[1300px]:h-[485px] max-md:h-[390px] pt-[18px]">
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
          className="spotlight-swiper h-full rounded-2xl overflow-hidden relative"
          style={{
            "--swiper-pagination-bullet-inactive-color":
              "rgba(255, 255, 255, 0.55)",
            "--swiper-pagination-bullet-inactive-opacity": "1",
          }}
        >
          <div className="absolute right-[22px] top-[26px] flex space-x-3 z-[20]">
            <div className="button-prev"></div>
            <div className="button-next"></div>
          </div>

          {spotlights.map((item, index) => (
            <SwiperSlide className="relative" key={item.id || index}>
              <Banner item={item} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-white">No spotlights to show.</p>
      )}
    </div>
  );
};

export default Spotlight;
