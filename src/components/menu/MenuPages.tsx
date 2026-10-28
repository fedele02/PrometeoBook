import Link from "next/link";
import { getPublicContent } from "@/lib/data";
import { localizeMenu, MENU_PATH, MENU_TEXT, type Lang } from "@/lib/i18n";
import { MotionProvider } from "@/components/motion/Reveal";
import { Emblem, Ornament, Wordmark } from "@/components/Logo";
import { LangSwitch } from "./LangSwitch";
import { MenuView } from "./MenuView";

const siteLinks = { it: MENU_PATH.it.site, en: MENU_PATH.en.site };
const tableLinks = { it: MENU_PATH.it.table, en: MENU_PATH.en.table };

/** /menu and /en/menu: the menu inside the site, with one invitation to book at the end. */
export async function SiteMenu({ lang }: { lang: Lang }) {
  const { settings, menu: all } = await getPublicContent();
  const menu = localizeMenu(all, lang);
  const t = MENU_TEXT[lang];

  return (
    <div lang={lang}>
      <section className="bg-ink px-6 pb-8 pt-32 text-center md:pb-12 md:pt-44">
        <p className="label text-[0.7rem] text-muted">Prometeo Fine Dining</p>
        <h1 className="caps mt-4 text-[3.2rem] text-gold md:text-[5rem]">{t.title}</h1>
        <Ornament align="center" className="mt-5" />
        <p className="mt-5 font-serif text-xl italic text-cream/80">{t.subtitle}</p>
        <LangSwitch lang={lang} hrefs={siteLinks} className="mt-5" />
      </section>

      {menu.categories.length ? (
        <MenuView categories={menu.categories} dishes={menu.dishes} lang={lang} />
      ) : (
        <p className="px-6 py-24 text-center text-cream/60">{t.empty}</p>
      )}

      <section className="px-6 pb-32 pt-16 text-center md:pb-24">
        <p className="mx-auto max-w-md text-sm text-muted">{t.allergyNote}</p>
        {settings.booking.enabled && (
          <Link href="/prenota" className="btn btn-gold mt-8">
            {t.book}
          </Link>
        )}
      </section>
    </div>
  );
}

/**
 * /qr and /en/qr: the menu opened from the QR code on the tables. Guests are
 * already seated, so there is no booking button, navigation or call bar.
 */
export async function TableMenu({ lang }: { lang: Lang }) {
  const { settings, menu: all } = await getPublicContent();
  const menu = localizeMenu(all, lang);
  const t = MENU_TEXT[lang];

  return (
    <MotionProvider>
      <div lang={lang}>
        <header className="bg-ink px-6 pb-6 pt-[calc(env(safe-area-inset-top)+2.5rem)] text-center">
          <div className="flex flex-col items-center text-gold">
            <Emblem className="h-12 w-auto" />
            <Wordmark className="mt-4 h-5 w-auto" />
            <span className="font-display mt-2 text-[0.6rem] tracking-[0.55em]">FINE DINING</span>
          </div>
          <h1 className="caps mt-10 text-[2.6rem] text-cream">{t.title}</h1>
          <Ornament align="center" className="mt-4" />
          <p className="mt-4 font-serif text-xl italic text-cream/75">{t.tableSubtitle}</p>
          <LangSwitch lang={lang} hrefs={tableLinks} className="mt-3" />
        </header>

        <main>
          {menu.categories.length ? (
            <MenuView categories={menu.categories} dishes={menu.dishes} stickyTop="top-0" lang={lang} />
          ) : (
            <p className="px-6 py-24 text-center text-cream/60">{t.empty}</p>
          )}
        </main>

        <footer className="px-6 pb-[calc(env(safe-area-inset-bottom)+3rem)] pt-16 text-center">
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-cream/60">{t.tableAllergyNote}</p>
          {/* the restaurant's own motto: stays in Italian */}
          <p className="caps mx-auto mt-10 max-w-xs text-[0.95rem] leading-snug tracking-[0.08em] text-gold" lang="it">
            {settings.tagline}
          </p>
          <p className="mt-8 text-xs text-muted">
            {settings.name} {settings.subtitle} · {settings.address}, {settings.city}
          </p>
        </footer>
      </div>
    </MotionProvider>
  );
}
