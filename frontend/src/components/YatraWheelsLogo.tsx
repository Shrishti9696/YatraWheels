interface LogoProps {
  size?: number;
  className?: string;
}

export function YatraWheelsLogoMark({ size = 36, className = "" }: LogoProps) {
  return (
    <img
      src="/logo-mark.png"
      alt="YatraWheels mark"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`object-contain ${className}`}
      draggable={false}
    />
  );
}

export function YatraWheelsWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight text-lg ${className}`}>
      Yatra<span className="gradient-text">Wheels</span>
    </span>
  );
}
