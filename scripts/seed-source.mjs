// Compact authoring format for seed content (split into parts: seed-core.mjs + seed-a/b/c.mjs).
// `node scripts/build-seed.mjs` expands it into src/data/seed.json and supabase/seed.sql.
import { L, categories } from './seed-core.mjs';
import a from './seed-a.mjs';
import b from './seed-b.mjs';
import c from './seed-c.mjs';

export { L, categories };
export const services = [...a, ...b, ...c];
