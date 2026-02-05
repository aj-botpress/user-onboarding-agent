interface GetStartedCTAProps {
  variant: "adk" | "studio" | "explore";
}

const config = {
  adk: {
    title: "Get started building with Botpress",
    subtitle: "We'll get you started with the Botpress ADK",
    href: "https://botpress.com/docs/adk",
    style: "full",
  },
  studio: {
    title: "Get started building with Botpress",
    subtitle: "We'll get you started with Botpress Studio",
    href: "https://studio.botpress.cloud",
    style: "full",
  },
  explore: {
    title: "Continue exploring Botpress",
    subtitle: null,
    href: "https://botpress.com",
    style: "simple",
  },
} as const;

export function GetStartedCTA({ variant }: GetStartedCTAProps) {
  const { title, subtitle, href, style } = config[variant];

  // Simple style - just text and arrow
  if (style === "simple") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all p-4 group animate-fade-in-up"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </a>
    );
  }

  // Full style - with icon and subtitle
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 border border-gray-100 hover:border-gray-200 transition-all hover:shadow-lg group animate-fade-in-up"
    >
      <div className="relative p-5">
        {/* Share icon */}
        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </div>

        {/* Title with arrow */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <svg
            className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {/* Subtitle */}
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </a>
  );
}
