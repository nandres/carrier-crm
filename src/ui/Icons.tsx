import type { ReactNode, SVGProps } from 'react';

/** Authored set on a 20 px grid: one stroke, round ends, like bent tube. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const TubesIcon = () => (
  <Icon>
    <path d="M3 4.5h14M5.5 4.5V15a1.75 1.75 0 0 0 3.5 0V4.5M11 4.5V15a1.75 1.75 0 0 0 3.5 0V4.5" />
  </Icon>
);
export const ChaseIcon = () => (
  <Icon>
    <path d="M4.5 13.5V9a5.5 5.5 0 0 1 11 0v4.5l1.2 1.8H3.3l1.2-1.8ZM8.5 17.5h3" />
  </Icon>
);
export const ClientsIcon = () => (
  <Icon>
    <circle cx="7.5" cy="7" r="3" />
    <path d="M2.5 16.5c.4-3 2.4-4.7 5-4.7s4.6 1.7 5 4.7M13 4.4a3 3 0 0 1 0 5.2M14.8 12.3c1.5.7 2.5 2.1 2.7 4.2" />
  </Icon>
);
export const CashIcon = () => (
  <Icon>
    <path d="M10 3v9.5M6 9l4 4 4-4M3.5 16.5h13" />
  </Icon>
);
export const SearchIcon = () => (
  <Icon>
    <circle cx="8.75" cy="8.75" r="5.25" />
    <path d="m13 13 3.75 3.75" />
  </Icon>
);
export const PlusIcon = () => (
  <Icon>
    <path d="M10 4v12M4 10h12" />
  </Icon>
);
export const CloseIcon = () => (
  <Icon>
    <path d="m5 5 10 10M15 5 5 15" />
  </Icon>
);
export const MoreIcon = () => (
  <Icon>
    <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
  </Icon>
);
export const LateIcon = () => (
  <Icon width="13" height="13" strokeWidth="2">
    <path d="M10 3.2 18 17H2L10 3.2ZM10 8.5v3.8M10 14.8v.1" />
  </Icon>
);
export const CheckIcon = () => (
  <Icon width="13" height="13" strokeWidth="2.2">
    <path d="m4 10.5 4 4 8-9" />
  </Icon>
);
export const ArrowIcon = () => (
  <Icon width="14" height="14">
    <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
  </Icon>
);
