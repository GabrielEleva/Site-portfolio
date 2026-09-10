interface BrandLogoProps {
  settingsLogo?: string | null;
  compact?: boolean;
}

function FallbackLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${compact ? "scale-[.84] origin-left" : ""}`}>
      <span className="relative grid size-9 place-items-center rounded-full border border-[#e50914]/70 bg-[#e50914]/10">
        <span className="size-4 rounded-full border-2 border-[#e50914]" />
        <span className="absolute h-px w-7 rotate-45 bg-[#e50914]/70" />
        <span className="absolute h-px w-7 -rotate-45 bg-[#e50914]/70" />
      </span>
      <span className="leading-none">
        <span className="block font-heading text-[12px] font-semibold tracking-[.38em] text-zinc-300">ELEVA</span>
        <span className="mt-0.5 block font-heading text-[14px] font-semibold tracking-[.12em] text-[#ff1e27]">filmmaking</span>
      </span>
    </span>
  );
}

export default function BrandLogo({ settingsLogo, compact = false }: BrandLogoProps) {
  const isImage = Boolean(settingsLogo && !settingsLogo.toLowerCase().includes(".pdf"));
  if (isImage) {
    return (
      <img
        src={settingsLogo ?? ""}
        alt="Eleva Filmmaking"
        className={`max-h-12 w-auto max-w-[190px] object-contain object-left ${compact ? "max-h-8 max-w-[140px]" : ""}`}
        data-testid="brand-logo-image"
      />
    );
  }
  return <FallbackLogo compact={compact} />;
}