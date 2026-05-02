interface LogoProps {
  height?: number;
  className?: string;
}

export function YatraWheelsLogoMark({ height = 44, className = "" }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="YatraWheels"
      height={height}
      style={{ height: `${height}px`, width: "auto" }}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}

export function YatraWheelsWordmark({ className = "" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="YatraWheels"
      height={44}
      style={{ height: "44px", width: "auto" }}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}
