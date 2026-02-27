"use client";
export default function ToggleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rotate-[-15deg]"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3V21" stroke="currentColor" strokeWidth="2" />
      <path d="M12 5L17 8V16L12 19V5Z" fill="currentColor" />
    </svg>
  );
}
