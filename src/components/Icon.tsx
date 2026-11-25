import type { SVGProps } from 'react';

const P: Record<string, string> = {
  'id-card': 'M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11ZM8.5 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5.5 16c.4-1.7 1.7-2.5 3-2.5s2.6.8 3 2.5M14 9h4M14 12.5h4',
  passport: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM12 14.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM8.5 11h7M12 7.5c-1.3 1-1.8 2.2-1.8 3.5s.5 2.5 1.8 3.5M12 7.5c1.3 1 1.8 2.2 1.8 3.5S13.3 13.5 12 14.5M8.5 18h7',
  shield: 'M12 3 5 6v5.5c0 4.4 2.9 8 7 9.5 4.1-1.5 7-5.1 7-9.5V6l-7-3ZM9 12l2.2 2.2L15.5 10',
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 8h6M9 12h6M9 16h3',
  bolt: 'M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z',
  car: 'M5 16V11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11v5M3.5 16h17v2.5a1 1 0 0 1-1 1H17a1 1 0 0 1-1-1V17H8v1.5a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V16ZM7 13h10',
  building: 'M4 20V6l8-3 8 3v14M4 20h16M9 20v-4h6v4M8.5 9.5h1M14.5 9.5h1M8.5 13h1M14.5 13h1',
  graduation: 'm2.5 9.5 9.5-5 9.5 5-9.5 5-9.5-5ZM6.5 12v4.5c1.4 1.3 3.4 2 5.5 2s4.1-.7 5.5-2V12M21.5 9.5V15',
  heart: 'M12 20s-7.5-4.5-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10Z',
  briefcase: 'M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8M3 13h18',
  badge: 'M12 3l2.5 1.6 3-.2.9 2.9 2.4 1.8-1 2.8 1 2.8-2.4 1.8-.9 2.9-3-.2L12 21l-2.5-1.6-3 .2-.9-2.9L3.2 14.9l1-2.8-1-2.8 2.4-1.8.9-2.9 3 .2L12 3Zm-3 9 2 2 4-4',
  scale: 'M12 4v16M7 20h10M5 7h14M5 7l-3 7a3.2 3.2 0 0 0 6 0L5 7Zm14 0-3 7a3.2 3.2 0 0 0 6 0l-3-7Z',
  phone: 'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM11 18h2',
  map: 'M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.500 5.600 12 3Z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.500 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.500 4 8 8 0 1 0 20 14.500Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  print: 'M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M7 14h10v6H7v-6Z',
  share: 'M12 4v11M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6',
  check: 'M5 12.5l4.500 4.500L19 7.500',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.500 20c.8-3.500 3.700-5.500 7.500-5.500s6.700 2 7.500 5.500',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 7.800v.2',
  plus: 'M12 5v14M5 12h14',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M6 13l6 6 6-6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  dash: 'M4 13h7V4H4v9ZM13 20h7V11h-7v9ZM13 9h7V4h-7v5ZM4 20h7v-5H4v5Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  coins: 'M12 8c4.100 0 7-1 7-2.500S16.100 3 12 3 5 4 5 5.500 7.900 8 12 8Zm7-2.500v13C19 20 16.100 21 12 21s-7-1-7-2.500v-13M5 12c0 1.500 2.900 2.500 7 2.500s7-1 7-2.500',
};

export type IconName = keyof typeof P;

export default function Icon({ name, size = 22, filled = false, className, ...rest }: { name: string; size?: number; filled?: boolean } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const d = P[name] || P.folder;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={className} {...rest}>
      <path d={d} />
    </svg>
  );
}
