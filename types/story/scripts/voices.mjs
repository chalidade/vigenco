// ElevenLabs voices.
//   node scripts/voices.mjs                 your own voices (usable as story.json "voice")
//   node scripts/voices.mjs search [lang]   Voice Library voices for a language (default: id)
//   node scripts/voices.mjs add <owner_id> <voice_id> <name>   add a library voice to your account
try { process.loadEnvFile(".env"); } catch {}
const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error("ELEVENLABS_API_KEY is not set: put it in .env"); process.exit(1); }
const api = async (p, init = {}) => {
  const r = await fetch(`https://api.elevenlabs.io${p}`, { ...init, headers: { "xi-api-key": key, "content-type": "application/json" } });
  if (!r.ok) throw new Error(`ElevenLabs ${r.status}: ${await r.text()}`);
  return r.json();
};
const [cmd, a, b, c] = process.argv.slice(2);
if (cmd === "search") {
  const { voices } = await api(`/v1/shared-voices?language=${a ?? "id"}&page_size=30&sort=usage_character_count_1y`);
  for (const v of voices) console.log([v.name, v.gender, v.age, v.descriptive, v.use_case, `owner=${v.public_owner_id}`, `id=${v.voice_id}`, v.preview_url].join(" | "));
} else if (cmd === "add") {
  console.log(await api(`/v1/voices/add/${a}/${b}`, { method: "POST", body: JSON.stringify({ new_name: c ?? b }) }));
} else {
  const { voices } = await api("/v1/voices");
  for (const v of voices) console.log(`${v.name} | ${Object.values(v.labels ?? {}).join(", ")} | id=${v.voice_id}`);
}
