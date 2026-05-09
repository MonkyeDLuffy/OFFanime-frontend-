export default function Characters({ data }) {
  if (!data.length) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-5">Characters</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {data.map((char, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <img
                src={char.character?.image}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold">
                  {char.character?.name}
                </p>
                <p className="text-gray-400 text-sm">
                  {char.role}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-sm">
                  {char.voiceActors?.[0]?.name}
                </p>
                <p className="text-gray-400 text-xs">
                  Voice Actor
                </p>
              </div>

              <img
                src={char.voiceActors?.[0]?.image}
                className="w-10 h-10 rounded-lg object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}