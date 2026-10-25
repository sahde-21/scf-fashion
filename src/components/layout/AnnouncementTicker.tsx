"use client";

import { TICKER_MESSAGES } from "@/lib/config";

/**
 * Full-width cream announcement ticker (non-interactive — never blocks controls).
 * Edit messages in `src/lib/config.ts` → `TICKER_MESSAGES`.
 */
export function AnnouncementTicker() {
  const sequence = [...TICKER_MESSAGES, ...TICKER_MESSAGES];
  const label = TICKER_MESSAGES.join(" · ");

  return (
    <div className="announcement-ticker" role="marquee" aria-label={label}>
      <div className="announcement-ticker__track" aria-hidden="true">
        <TickerPass messages={sequence} />
        <TickerPass messages={sequence} />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

function TickerPass({ messages }: { messages: readonly string[] }) {
  return (
    <div className="announcement-ticker__pass">
      {messages.map((message, index) => (
        <span key={`${message}-${index}`} className="announcement-ticker__item">
          <span className="announcement-ticker__text">{message}</span>
          <span className="announcement-ticker__dot" aria-hidden />
        </span>
      ))}
    </div>
  );
}
