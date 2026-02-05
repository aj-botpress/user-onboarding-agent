const demos = [
  {
    title: "Lead generation",
    gradient: "from-amber-100 to-amber-200",
  },
  {
    title: "Internal knowledge",
    gradient: "from-purple-100 to-purple-200",
  },
  {
    title: "Information lookup",
    gradient: "from-blue-100 to-blue-200",
  },
];

export function DemosCarousel() {
  return (
    <div className="bg-gray-50 rounded-xl p-4 animate-fade-in-up">
      <a
        href="https://botpress.com/demos"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline mb-3"
      >
        Visit botpress.com/demos
        <svg
          className="w-4 h-4"
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
      <div className="flex gap-3 overflow-x-auto pb-2">
        {demos.map((demo, index) => (
          <div
            key={demo.title}
            className="flex-shrink-0 w-36 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`aspect-[4/3] bg-gradient-to-br ${demo.gradient} rounded-lg mb-2`}
            />
            <p className="text-sm text-gray-600">{demo.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
