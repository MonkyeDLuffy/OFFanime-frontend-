export default async function getStreamInfo(
  animeId,
  episodeId,
  provider = "megaplay-anilist",
  type = "sub",
  title = ""
) {
  const lang = type === "dub" ? "dub" : "sub";

  const megaplay =
    import.meta.env.VITE_MEGAPLAY_URL || "https://megaplayproxy1.vercel.app";

  const base = megaplay.replace(/\/$/, "");

  let url = "";

  if (provider === "megaplay-mal") {
    url = `${base}/watch/${animeId}?ep=${episodeId}&lang=${lang}&idType=mal`;
  } else {
    url = `${base}/watch/${animeId}?ep=${episodeId}&lang=${lang}&idType=anilist`;
  }

  return {
    provider,
    iframe: true,
    type: lang,
    title,
    url,
    embed: url,
  };
}
