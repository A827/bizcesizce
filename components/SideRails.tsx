'use client';
import { SponsorSlot } from './SponsorSlot';
import { AdSenseUnit } from './AdSenseUnit';

// Desktop-only side gutters (hidden on tablet/phone via CSS). Each rail shows
// your own sponsor slot first, then a Google AdSense unit (which only appears
// once a publisher id + slot id are configured). If neither has content the
// rail collapses to nothing — no empty boxes.
export function SideRails() {
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RAIL;
  return (
    <>
      <aside className="side-rail side-rail-left">
        <SponsorSlot placement="rail" />
        <AdSenseUnit slot={slot} />
      </aside>
      <aside className="side-rail side-rail-right">
        <SponsorSlot placement="rail" />
        <AdSenseUnit slot={slot} />
      </aside>
    </>
  );
}
