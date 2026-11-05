/** A C drawn as a length of tube, with a capsule on its way through the opening. */
export function CarrierMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="carrier-mark">
      <path d="M25 6H14a10 10 0 0 0 0 20h11" fill="none" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" />
      <rect x="13" y="12.5" width="13" height="7" rx="3.5" fill="currentColor" />
    </svg>
  );
}

/** Own lettering: the same bent tube as the mark, not a font. */
function CarrierWord() {
  return (
    <svg className="carrier-word" width="94" height="24" viewBox="0 -2 85 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12.1 8.4A6.5 6.5 0 1 0 12.1 17.6" />
      <path d="M27.5 6.5V19.5M27.5 13A6.5 6.5 0 1 1 14.5 13A6.5 6.5 0 1 1 27.5 13" />
      <path d="M33 19.5V6.5M33 12a5.5 5.5 0 0 1 5.5-5.5" />
      <path d="M43 19.5V6.5M43 12a5.5 5.5 0 0 1 5.5-5.5" />
      <path d="M53 19.5V6.5M53 1.2v.1" />
      <path d="M58.5 13H71.5A6.5 6.5 0 1 0 69.6 17.6" />
      <path d="M77 19.5V6.5M77 12a5.5 5.5 0 0 1 5.5-5.5" />
    </svg>
  );
}

export function CarrierLogo() {
  return (
    <span className="carrier-logo">
      <CarrierMark />
      <CarrierWord />
    </span>
  );
}
