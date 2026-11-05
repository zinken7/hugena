// Hugena mark: a white check (human verification) leading to a violet point (the AI claim).
export function BrandMark({ size = 30 }: { size?: number }) {
  return <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <rect className="brand-tile" width="32" height="32" rx="8.6"/>
    <path d="M8.1 17.9l4.5 4.5 7-8" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="23.2" cy="10.3" r="2.4" fill="#b98aff"/>
  </svg>;
}
