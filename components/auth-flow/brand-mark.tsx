import Image from 'next/image';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact ? 'flex items-center gap-3' : 'flex flex-col items-center gap-4'
      }
    >
      <div
        className={`${compact ? 'size-10 rounded-xl bg-[linear-gradient(145deg,#3b3355,#5f4d85)]' : 'size-14.5 rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,.22),rgba(149,103,254,.1))]'} grid place-items-center shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_12px_30px_rgba(0,0,0,.22)]`}
      >
        <Image
          src="/images/brand-mark.svg"
          alt=""
          width={64}
          height={46}
          className={
            compact ? 'h-auto w-[23px]' : 'brand-mark-image h-auto w-8'
          }
        />
      </div>
      <span
        className={`${compact ? 'text-sm text-[#252230]' : 'text-lg text-white'} font-medium`}
      >
        Paash Cash
      </span>
    </div>
  );
}
