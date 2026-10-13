/**
 * Shown the instant a tab is tapped, while the page loads its data: the bar
 * and the tabs stay put, only the content area becomes this placeholder.
 */
export default function PanelLoading() {
  const bar = "rounded-lg bg-white/[0.06] motion-safe:animate-pulse";
  return (
    <div role="status" aria-label="Caricamento">
      <div className={`${bar} h-9 w-48 md:h-10`} />
      <div className={`${bar} mt-3 h-4 w-72 max-w-full`} />
      <div className="mt-8 space-y-3">
        <div className={`${bar} h-24`} />
        <div className={`${bar} h-24`} />
        <div className={`${bar} h-24`} />
      </div>
    </div>
  );
}
