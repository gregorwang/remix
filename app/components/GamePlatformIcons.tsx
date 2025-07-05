interface IconProps {
  className?: string;
}

export function PlayStationIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.985 2.596v17.548l3.915 1.261V6.688c0-.69.304-1.151.794-.991.636.181.794.991.794.991v10.516l4.028.69V8.112c0-2.145-1.192-3.123-2.783-3.123-1.591 0-2.783.978-2.783 3.123v-.69c0-.69-.158-1.81-.794-.991-.49.16-.794.301-.794.991V2.596H8.985z" />
    </svg>
  );
}

export function SwitchIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.176 24h3.674c3.376 0 6.15-2.774 6.15-6.15V6.15C24 2.775 21.226 0 17.85 0H14.176c-.663 0-1.2.538-1.2 1.2v21.6c0 .662.537 1.2 1.2 1.2z" />
      <path d="M9.824 24H6.15C2.774 24 0 21.226 0 17.85V6.15C0 2.775 2.774 0 6.15 0h3.674c.662 0 1.2.538 1.2 1.2v21.6c0 .662-.538 1.2-1.2 1.2z" />
    </svg>
  );
}

export function PCIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm8-5v10l8-5-8-5z" />
    </svg>
  );
} 