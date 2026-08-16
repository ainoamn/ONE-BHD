type BrandLogoProps = {
  kind?: "full" | "mark";
  tone?: "ink" | "light" | "accent";
  className?: string;
};

export function BrandLogo({ kind = "full", tone = "ink", className = "" }: BrandLogoProps) {
  return (
    <span
      className={`official-logo official-logo-${kind} official-logo-${tone} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
