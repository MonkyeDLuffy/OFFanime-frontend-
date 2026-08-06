import ContinueWatching from "@/src/components/ContinueWatching";
import { useState, useEffect } from "react";
import website_name from "@/src/config/website.js";
import Spotlight from "@/src/components/spotlight/Spotlight.jsx";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import Genre from "@/src/components/genres/Genre.jsx";
import AnimeTop10Rail from "@/src/components/topten/AnimeTop10Rail.jsx";
import Loader from "@/src/components/Loader/Loader.jsx";
import Error from "@/src/components/error/Error.jsx";
import { useHomeInfo } from "@/src/context/HomeInfoContext.jsx";
import LazySection from "@/src/components/ui/LazySection/LazySection";
import { Helmet } from "react-helmet-async";
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  generateItemListSchema,
} from "@/src/utils/seo.utils";

function Home() {
  const { homeInfo, homeInfoLoading, error } = useHomeInfo();

  const [itemLimit, setItemLimit] = useState(() =>
    window.innerWidth > 1400 ? 10 : 12
  );

  useEffect(() => {
    const handleResize = () =>
      setItemLimit(window.innerWidth > 1400 ? 10 : 12);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (homeInfoLoading) return <Loader type="home" />;
  if (error) return <Error />;
  if (!homeInfo) return <Error error="404" />;

  const websiteSchema = generateWebsiteStructuredData();
  const organizationSchema = generateOrganizationStructuredData();
  const trendingSchema = homeInfo.trending
    ? generateItemListSchema(homeInfo.trending, "Trending Anime")
    : null;

  return (
    <>
      <Helmet>
        <title>{website_name} | Free Anime Streaming Platform</title>

        <meta
          name="description"
          content={`${website_name} is the best site to watch anime online for free. Stream thousands of English subbed and dubbed anime episodes in HD quality with no ads.`}
        />

        <meta
          name="keywords"
          content="offanime, watch anime free, anime online sub dub, free anime streaming, no ads anime, best anime site"
        />

        <link rel="canonical" href="https://offanime.cc" />

        <meta
          property="og:title"
          content={`${website_name} | Free Anime Streaming Platform`}
        />

        <meta
          property="og:description"
          content={`Watch high-quality anime online for free on ${website_name}. No ads, daily updates, and a massive library of subbed and dubbed content.`}
        />

        <meta property="og:url" content="https://offanime.cc" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />

        <meta
          name="twitter:title"
          content={`${website_name} | Free Anime Streaming Platform`}
        />

        <meta
          name="twitter:description"
          content={`Stream thousands of anime episodes for free in HD quality on ${website_name}. The best ad-free experience for anime fans!`}
        />

        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>

        {trendingSchema && (
          <script type="application/ld+json">
            {JSON.stringify(trendingSchema)}
          </script>
        )}
      </Helmet>

      <main className="pt-16 w-full">
        <Spotlight spotlights={homeInfo.spotlights} />

        {/* TOP 10 — Netflix-style rail placed right below the spotlight. Uses the
            existing home-API data (topten, falling back to trending when the
            API's topten array is empty) so NO new API calls are introduced. */}
        <section className="w-full px-[60px] mt-8 max-[1400px]:px-[40px] max-md:px-5">
          <AnimeTop10Rail
            data={homeInfo.topten?.length ? homeInfo.topten : homeInfo.trending}
          />
        </section>

        <div className="mt-6 px-[60px] max-[1400px]:px-[40px] max-md:px-5">
          <Genre data={homeInfo.genres} />
        </div>

        {/* Full-width content column. The old right-hand Trending ranking
            sidebar was removed, so every section now reflows edge-to-edge
            (with comfortable page padding) — no empty column left behind. */}
        <div className="w-full px-[60px] max-[1400px]:px-[40px] max-md:px-5">
          {/* Above the fold — render immediately. */}
          <CategoryCard
            label="Latest Episode"
            data={homeInfo.latest_episode}
            className="mt-8"
            path="recently-updated"
            limit={itemLimit}
            slider
          />

          <ContinueWatching />

          {/* Below the fold — mount only when scrolled near so its posters
              don't get downloaded on first paint. Each category is its own
              premium horizontal carousel (own title / data / arrows / drag /
              touch), all powered by the single reusable AnimeRail via the
              CategoryCard `slider` prop — no duplicated slider logic. */}
          <LazySection minHeight={520} className="mt-8 space-y-8">
            <CategoryCard
              label="Top Airing"
              data={homeInfo.top_airing}
              path="top-airing"
              limit={itemLimit}
              slider
            />
            <CategoryCard
              label="Most Favorite"
              data={homeInfo.most_favorite}
              path="most-favorite"
              limit={itemLimit}
              slider
            />
            <CategoryCard
              label="Latest Completed"
              data={homeInfo.latest_completed}
              path="completed"
              limit={itemLimit}
              slider
            />
          </LazySection>
        </div>
      </main>
    </>
  );
}

export default Home;
