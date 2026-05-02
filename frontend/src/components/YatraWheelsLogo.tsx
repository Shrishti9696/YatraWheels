interface LogoProps {
  height?: number;
  className?: string;
}

export function YatraWheelsLogoMark({ height = 36, className = "" }: LogoProps) {
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
      height={28}
      style={{ height: "28px", width: "auto" }}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}
