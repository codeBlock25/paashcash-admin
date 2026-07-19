import { ReceiptText } from 'lucide-react';
import Image from 'next/image';

import { BrandMark } from './brand-mark';

export function PromoPanel() {
  return (
    <aside className="auth-promo relative hidden min-h-0 overflow-hidden rounded-[22px] lg:block">
      <div className="promo-photo absolute overflow-hidden border border-white/80 bg-white/5 shadow-[0_28px_65px_rgba(8,7,20,.28)]">
        <Image
          src="/images/auth-image.png"
          alt="Business traveler speaking on the phone"
          fill
          priority
          sizes="35vw"
          className="object-cover object-[51%_center]"
        />
      </div>

      <div className="promo-card promo-card-bills">
        <ReceiptText aria-hidden="true" className="promo-receipt" />
        <span>Airtime &amp; Bills</span>
      </div>

      <div className="promo-card promo-card-gifts">Gift cards</div>

      <div className="promo-card promo-card-visa">
        <span className="promo-card-eyebrow">Agencies</span>
        <span>Visa Applicants</span>
      </div>

      <div className="promo-brand">
        <BrandMark />
      </div>
    </aside>
  );
}
