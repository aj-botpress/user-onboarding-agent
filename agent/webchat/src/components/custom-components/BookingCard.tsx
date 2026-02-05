export function BookingCard() {
  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-white animate-fade-in-up">
      {/* Header row - avatars and duration */}
      <div className="flex items-center justify-between mb-4">
        {/* Avatar stack */}
        <div className="flex -space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-2 border-white" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-indigo-400 border-2 border-white" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 border-2 border-white" />
        </div>

        {/* Duration badge */}
        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>15 minutes</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Talk to a Product Expert
      </h3>

      {/* Subtitle */}
      <p className="text-gray-500 text-sm mb-4">
        Bring your bot idea to life with a free consultation and personalized proposal
      </p>

      {/* Book Now button */}
      <a
        href="https://calendly.com/botpress-sales/demo"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-gray-900 text-white text-center py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
      >
        Book Now
      </a>
    </div>
  );
}
