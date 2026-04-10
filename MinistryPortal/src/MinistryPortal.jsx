import { useState, useRef, useEffect } from "react";

/* ── House data ─────────────────────────────────────────────────────────── */
const HOUSES = [
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    color: "text-sky-300",
    border: "border-sky-700",
    glow: "hover:shadow-sky-900/60",
    link: "https://github.com/GulfNexus/Amazing-Grace",
    emoji: "🏠",
    desc: "The House of Shelter. A sanctuary of compassion and restoration.",
  },
  {
    id: "voice-of-jesus",
    title: "Voice of Jesus Ministry",
    color: "text-purple-400",
    border: "border-purple-700",
    glow: "hover:shadow-purple-900/60",
    link: "https://github.com/Gamified-Learning-Matrix/Voice-of-Jesus",
    emoji: "🎵",
    desc: "The House of Revelation. A Nimbus‑Land domain of resonance and ascension.",
  },
  {
    id: "gamified-learning",
    title: "Gamified Learning",
    color: "text-green-400",
    border: "border-green-700",
    glow: "hover:shadow-green-900/60",
    link: "https://gamifiedlearning.org",
    emoji: "🎮",
    desc: "The House of Wisdom. A realm of challenge, mastery, and star‑forged growth.",
  },
  {
    id: "limitless-nexus",
    title: "Limitless Nexus",
    color: "text-red-400",
    border: "border-red-700",
    glow: "hover:shadow-red-900/60",
    link: "https://limitlessnexus.com",
    emoji: "♾️",
    desc: "The House of Infinity. A gateway to uncharted realms of potential.",
  },
];

/* ── HouseCard ──────────────────────────────────────────────────────────── */
function HouseCard({ title, color, border, glow, link, desc, emoji }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-gray-900 border ${border} rounded-xl p-5 sm:p-6 text-center
                  hover:-translate-y-1 hover:shadow-xl ${glow} transition-all duration-200
                  block focus:outline-none focus:ring-2 focus:ring-sky-400`}
    >
      <div className="text-3xl mb-3" aria-hidden="true">{emoji}</div>
      <h3 className={`${color} text-xl sm:text-2xl font-semibold mb-2`}>{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </a>
  );
}

/* ── HouseDropdown (Tailwind UI–style menu) ─────────────────────────────── */
function HouseDropdown({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  /* close on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* close on Escape */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600
                   rounded-lg text-sm font-medium text-white hover:bg-gray-700
                   focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
      >
        <span>Jump to House</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0
               111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75
               0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl
                     bg-gray-900 border border-gray-700 shadow-xl ring-1
                     ring-black/50 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {HOUSES.map((house) => (
              <button
                key={house.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(house.id);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-200
                           hover:bg-gray-800 hover:text-white transition-colors text-left"
              >
                <span aria-hidden="true">{house.emoji}</span>
                {house.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MinistryPortal (main export) ───────────────────────────────────────── */
export default function MinistryPortal() {
  const [open, setOpen] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const cardRefs = useRef({});

  function handleHouseSelect(id) {
    if (!open) setOpen(true);
    setHighlightId(id);
    /* scroll to card after state update */
    setTimeout(() => {
      cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
      {/* scrolling star-field */}
      <div className="stars" aria-hidden="true" />

      {/* ── Landing splash ─────────────────────────────────────────── */}
      {!open && (
        <section className="h-screen bg-gradient-to-b from-sky-300 to-black flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-xl mb-4 leading-tight">
            House of Amazing Grace
          </h1>
          <p className="text-base sm:text-lg text-yellow-50 max-w-xl mb-8 leading-relaxed">
            Welcome, traveler. This sanctuary stands as the House of Shelter — a
            beacon of restoration within the GulfNexus Kingdom.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <button
              onClick={() => setOpen(true)}
              className="px-6 py-3 bg-cyan-400 text-black font-bold rounded-lg
                         hover:bg-sky-300 active:scale-95 transition text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              Enter the Ministry Portal
            </button>
            <HouseDropdown onSelect={handleHouseSelect} />
          </div>
        </section>
      )}

      {/* ── Portal dashboard ───────────────────────────────────────── */}
      {open && (
        <section className="max-w-6xl mx-auto py-12 sm:py-16 px-4 sm:px-6">
          {/* top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-sky-300 drop-shadow text-center sm:text-left">
              The Four Houses of GulfNexus
            </h2>
            <div className="flex justify-center sm:justify-end gap-3">
              <HouseDropdown onSelect={handleHouseSelect} />
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-2 text-xs sm:text-sm text-gray-400 border border-gray-700
                           rounded-lg hover:border-gray-500 hover:text-gray-200 transition
                           focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Return to landing page"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* house cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            {HOUSES.map((house) => (
              <div
                key={house.id}
                ref={(el) => (cardRefs.current[house.id] = el)}
                className={`rounded-xl transition-all duration-300 ${
                  highlightId === house.id
                    ? "ring-2 ring-sky-400 scale-[1.02]"
                    : ""
                }`}
              >
                <HouseCard {...house} />
              </div>
            ))}
          </div>

          {/* footer note */}
          <p className="mt-12 text-center text-gray-600 text-xs">
            GulfNexus Kingdom · Ministry Portal · All houses connected through Star Road
          </p>
        </section>
      )}
    </div>
  );
}
