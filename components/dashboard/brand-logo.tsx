import Image from 'next/image';

export function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/images/brand-mark.svg"
        alt=""
        width={38}
        height={28}
        priority
        className="h-7 w-auto [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(94%)_saturate(1381%)_hue-rotate(229deg)_brightness(101%)_contrast(101%)]"
      />
      <span className="text-[19px] font-medium tracking-[-0.025em] text-[#5426c7]">
        Paash Cash
      </span>
    </div>
  );
}
