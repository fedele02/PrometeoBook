import "server-only";
import { unstable_cache } from "next/cache";
import { isSupabaseEnabled } from "../supabase/env";
import { localRepo } from "./local";
import type { Repo } from "./repo";
import { supabaseRepo } from "./supabase";

let instance: Repo | null = null;
export function repo(): Repo {
  instance ??= isSupabaseEnabled() ? supabaseRepo() : localRepo;
  return instance;
}

/** Cache tag for everything the public site shows; busted by admin edits. */
export const CONTENT_TAG = "content";

/** Settings + visible menu, cached until the admin changes something. */
export const getPublicContent = unstable_cache(
  async () => {
    const r = repo();
    const [settings, menu] = await Promise.all([r.getSettings(), r.getMenu()]);
    return { settings, menu };
  },
  // bump the version when Settings gets new fields: cached entries of the old shape would lack them
  ["public-content-v2"],
  { tags: [CONTENT_TAG], revalidate: 3600 },
);
