export default async function getStreamInfo(
  animeId,
  episodeId,
  provider = "megaplay",
  type = "sub",
  title = ""
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
    )}&ep=${encodeURIComponent(episodeId)}&audio=${lang}`;

    console.log("AnimePahe API URL:", url);

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`AnimePahe API failed: ${res.status}`);
    }

    const data = await res.json();

    if (data?.error) {
      throw new Error(data.error);
    }

    const allStreams = data?.streams?.all || data?.selected?.streams || [];

    const filtered = allStreams.filter((item) => {
      const isDub = item?.original?.isDub === true;
      return lang === "dub" ? isDub : !isDub;
    });

    const qualities = ["360p", "720p", "1080p"]
      .map((quality) => {
        const found = filtered.find((item) => item.quality === quality);

        if (!found) return null;

        return {
          quality,
          label: `Kiwi-Stream-${quality}`,
          embed: found?.original?.embed || "",
          url: found?.url || "",
          rawUrl: found?.rawUrl || "",
          item: found,
        };
      })
      .filter(Boolean);

    const defaultSource =
      qualities.find((x) => x.quality === "720p") ||
      qualities.find((x) => x.quality === "1080p") ||
      qualities.find((x) => x.quality === "360p") ||
      qualities[0];

    if (!defaultSource?.embed) {
      throw new Error(`AnimePahe ${lang} embed not found`);
    }

    return {
      provider: "animepahe",
      iframe: true,
      type: lang,
      title,
      url: defaultSource.embed,
      embed: defaultSource.embed,
      selectedQuality: defaultSource.quality,
      qualities,
      raw: data,
    };
  }

  const megaplay =
    import.meta.env.VITE_MEGAPLAY_URL || "https://megaplayproxy1.vercel.app";

  return {
    provider: "megaplay",
    iframe: true,
    type: lang,
    url: `${megaplay.replace(
      /\/$/,
      ""
    )}/watch/${animeId}?ep=${episodeId}&lang=${lang}`,
  };
}
