import { STORE_WHATSAPP_LOCAL } from "@/lib/config";

/**
 * Slim top announcement bar — only truthful claims for this demo storefront.
 * Cash-on-delivery is not asserted; payment terms are confirmed on WhatsApp.
 */
export function AnnouncementBar() {
  const desktop = [
    "WhatsApp ordering",
    `Chat ${STORE_WHATSAPP_LOCAL}`,
    "USD & IQD pricing",
    "No card payments on site",
  ];

  return (
    <div
      className="announcement-bar"
      role="region"
      aria-label="Store announcements"
    >
      {/* Compact single line on small screens */}
      <p className="announcement-bar__text announcement-bar__text--mobile">
        WhatsApp · {STORE_WHATSAPP_LOCAL} · USD &amp; IQD · No cards on site
      </p>
      <p className="announcement-bar__text announcement-bar__text--desktop">
        {desktop.map((part, i) => (
          <span key={part} className="announcement-bar__part">
            {i > 0 ? (
              <span className="announcement-bar__sep" aria-hidden>
                ·
              </span>
            ) : null}
            {part}
          </span>
        ))}
      </p>
    </div>
  );
}
