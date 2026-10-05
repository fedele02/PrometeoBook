import QRCode from "qrcode";
import { SITE_URL } from "@/lib/site";
import { Card } from "./ui";

/** QR code for the table menu (/qr), ready to print. Rendered on the server. */
export async function QrCard() {
  const url = `${SITE_URL}/qr`;
  const [svg, png] = await Promise.all([
    QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#0b0b0b", light: "#ffffff" } }),
    QRCode.toDataURL(url, { width: 1200, margin: 2, color: { dark: "#0b0b0b", light: "#ffffff" } }),
  ]);

  return (
    <Card className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="mx-auto w-36 shrink-0 bg-white p-2 sm:mx-0" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="min-w-0">
        <h2 className="font-display text-lg tracking-[0.06em]">Menu al tavolo (QR)</h2>
        <p className="mt-1 text-sm text-cream/60">
          Stampa questo QR sui tavoli: apre il menu senza i tasti di prenotazione.{" "}
          <a href="/qr" target="_blank" className="text-gold-light underline underline-offset-2">
            Anteprima
          </a>
        </p>
        <p className="mt-2 text-xs text-cream/45 [overflow-wrap:anywhere]">{url}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={png} download="prometeo-menu-qr.png" className="btn btn-line min-h-10 px-4 text-xs">
            Scarica PNG
          </a>
          <a
            href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
            download="prometeo-menu-qr.svg"
            className="btn btn-line min-h-10 px-4 text-xs"
          >
            Scarica SVG (per la tipografia)
          </a>
        </div>
      </div>
    </Card>
  );
}
