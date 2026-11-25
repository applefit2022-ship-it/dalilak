import { config } from '../lib/config';

/** Reserved, DISABLED-by-default ad / sponsored slot.
 *  Flip `config.adsEnabled` in src/lib/config.ts to render a placeholder container.
 *  No ad network is integrated: to monetise later, render your network's tag inside this component. */
export default function AdSlot({ id, className = '' }: { id: string; className?: string }) {
  if (!config.adsEnabled) return null;
  return (
    <aside className={`ad-slot no-print ${className}`} data-enabled="true" data-slot={id} aria-label="Advertisement">
      {/* ad network tag goes here */}
    </aside>
  );
}
