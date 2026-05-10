import logoTitle from "@/src/config/logoTitle.js";
import website_name from "@/src/config/website.js";
import { Link } from "react-router-dom";
import { FaDiscord, FaTelegram } from "react-icons/fa";

function Footer() {
  return (
    <footer className="w-full mt-auto">
      {/* Logo Section */}
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <img
              src="/footer.png"
              alt={logoTitle}
              className="h-[100px] w-[150px] object-contain"
            />

            <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-10">
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-[#5865F2] transition-all duration-300 hover:scale-110"
              >
                <FaDiscord size={28} />
              </a>

              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-[#26A5E4] transition-all duration-300 hover:scale-110"
              >
                <FaTelegram size={28} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#0a0a0a] border-t border-white/5 mt-6">
        <div className="max-w-[1920px] mx-auto px-4 py-6">
          
          {/* A-Z List */}
          <div className="mb-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 items-center sm:items-start">
              <h2 className="text-sm font-medium text-white">
                A-Z LIST
              </h2>

              <span className="text-sm text-white/60">
                Browse anime alphabetically
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
              {[
                "All",
                "#",
                "0-9",
                ...Array.from(
                  { length: 26 },
                  (_, i) => String.fromCharCode(65 + i)
                ),
              ].map((item, index) => (
                <Link
                  to={`az-list/${item === "All" ? "" : item}`}
                  key={index}
                  className="px-2.5 py-1 text-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors duration-300"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Footer Links */}
            <div className="flex gap-4 flex-wrap justify-center sm:justify-start mt-4">
              <Link
                to="/terms-of-service"
                className="text-sm text-white/60 hover:text-white transition-colors duration-300"
              >
                Terms of Service
              </Link>

              <Link
                to="/dmca"
                className="text-sm text-white/60 hover:text-white transition-colors duration-300"
              >
                DMCA
              </Link>

              <Link
                to="/contact"
                className="text-sm text-white/60 hover:text-white transition-colors duration-300"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Legal + Credit */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-white/40 border-t border-white/5 pt-5">
            
            {/* Left Side */}
            <div className="space-y-2 text-center lg:text-left">
              <p className="max-w-4xl">
                {website_name} does not host any files, it merely pulls
                streams from 3rd party services. Legal issues should be
                taken up with the file hosts and providers.{" "}
                {website_name} is not responsible for any media files shown
                by the video providers.
              </p>

              <p>
                © 2026{" "}
                <a
                  href="https://offanime.site"
                  className="hover:text-white/70 underline transition-colors duration-300"
                >
                  {website_name}
                </a>
                . All rights reserved.
              </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 text-white/50 tracking-wide">
              <span className="hover:text-white/80 transition-colors duration-300">
                Made for Educational Purpose by Earth
              </span>

              <span className="text-purple-400 animate-pulse text-lg drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                ★
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
