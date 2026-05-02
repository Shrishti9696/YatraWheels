interface LogoProps {
  size?: number;
  className?: string;
}

export function YatraWheelsLogoMark({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="YatraWheels"
    >
      <defs>
        <linearGradient id="yw-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f5ef7" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id="yw-arrow" x1="20" y1="8" x2="20" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Background — rounded square */}
      <rect width="40" height="40" rx="11" fill="url(#yw-bg)" />

      {/* Outer ring — thin circle, like a steering wheel / globe */}
      <circle cx="20" cy="20" r="12" stroke="white" strokeWidth="1.6" strokeOpacity="0.25" fill="none" />

      {/* Navigation cursor / arrow — bold upward-pointing triangle */}
      {/* Left half — slightly brighter */}
      <path
        d="M20 8 L28 30 L20 26 Z"
        fill="white"
        fillOpacity="0.55"
      />
      {/* Right half — bright white */}
      <path
        d="M20 8 L12 30 L20 26 Z"
        fill="white"
        fillOpacity="1"
      />

      {/* Center notch at base of arrow */}
      <path
        d="M15.5 28.5 L20 26 L24.5 28.5"
        stroke="url(#yw-bg)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Destination dot — small filled circle at tip */}
      <circle cx="20" cy="8.5" r="1.8" fill="white" />
    </svg>
  );
}

export function YatraWheelsWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight text-lg ${className}`}>
      Yatra<span className="gradient-text">Wheels</span>
    </span>
  );
}
