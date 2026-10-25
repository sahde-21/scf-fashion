import { Reveal } from "@/components/ui/Reveal";

const ITEMS = [
  {
    title: "Carefully selected",
    detail: "Curated editorial pieces",
    icon: "diamond",
  },
  {
    title: "WhatsApp ordering",
    detail: "You send the message",
    icon: "chat",
  },
  {
    title: "USD & IQD",
    detail: "Fixed demo rate shown",
    icon: "currency",
  },
  {
    title: "Privacy-minded",
    detail: "No card data on site",
    icon: "lock",
  },
] as const;

function StripIcon({ name }: { name: (typeof ITEMS)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    className: "h-5 w-5",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "diamond":
      return (
        <svg {...common}>
          <path d="M12 3 3 10l9 11 9-11-9-7Z" />
          <path d="M3 10h18" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-4 3.5V6.5Z" />
        </svg>
      );
    case "currency":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10M9.5 9.5c.6-1 1.6-1.5 2.5-1.5 1.4 0 2.5.7 2.5 2s-1.1 2-2.5 2h-1c-1.4 0-2.5.7-2.5 2s1.1 2 2.5 2c.9 0 1.9-.5 2.5-1.5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="1" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    default:
      return null;
  }
}

export function TrustStrip() {
  return (
    <section
      className="border-b border-[var(--line)] bg-[var(--background)]"
      aria-label="Store highlights"
    >
      <Reveal>
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-4">
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className="flex flex-col items-center gap-3 bg-[var(--background)] px-4 py-8 text-center sm:py-10"
            >
              <span className="text-[var(--gold)]">
                <StripIcon name={item.icon} />
              </span>
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--ink)]">
                  {item.title}
                </p>
                <p className="mt-1.5 text-xs font-light text-[var(--muted)]">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
