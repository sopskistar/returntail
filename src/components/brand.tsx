import Link from 'next/link';
export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="35"
      height="35"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 30V10h10a8 8 0 0 1 0 16h-7m7 0 10 9"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="square"
      />
      <path d="M20 17l-7 7 7 7" stroke="currentColor" strokeWidth="4" strokeLinejoin="miter" />
    </svg>
  );
}
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="ReturnTail home">
      <Mark />
      <span>returntail</span>
    </Link>
  );
}
