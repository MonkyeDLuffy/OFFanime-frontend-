export default async function getStreamInfo(
  animeId,
  episodeId,
  provider = "megaplay",
  type = "sub"
) {
  const lang = type === "dub" ? "dub" : "sub";

  if (provider === "animepahe") {
    const animepaheApi =
      import.meta.env.VITE_ANIMEPAHE_API ||
      "https://anime-streaming-system-1.onrender.com";

    const url = `${animepaheApi.replace(
      /\/$/,
      ""
    )}/watch?anilistId=${encodeURIComponent(
      animeId
    )}&ep=${encodeURIComponent(episodeId)}`;

    console.log("AnimePahe API URL:", url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`AnimePahe API failed: ${res.status}`);
    }

    const data = await res.json();

    if (data?.error) {
      throw new Error(data.error);
    }

    const proxiedUrl =
      lang === "dub"
        ? data?.streams?.dub?.[0]?.url
        : data?.streams?.sub?.[0]?.url;

    if (!proxiedUrl) {
      throw new Error(`AnimePahe ${lang} stream not found`);
    }

    return {
      provider: "animepahe",
      iframe: true,
      url: `https://www.m3u8player.online/embed/m3u8?url=${encodeURIComponent(
        proxiedUrl
      )}`,
      raw: data,
    };
  }

  const megaplay =
    import.meta.env.VITE_MEGAPLAY_URL || "https://megaplayproxy1.vercel.app";

  return {
    provider: "megaplay",
    iframe: true,
    url: `${megaplay.replace(
      /\/$/,
      ""
    )}/watch/${animeId}?ep=${episodeId}&lang=${lang}`,
  };
}
