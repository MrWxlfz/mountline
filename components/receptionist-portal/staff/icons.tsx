/* Simple line icons drawn in the spirit of SF Symbols (not copies of them), for the staff app preview. */

type IconProps = { size?: number }

const svg = (size: number, children: React.ReactNode, viewBox = "0 0 24 24") => (
  <svg viewBox={viewBox} width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

export const PhoneIcon = ({ size = 20 }: IconProps) =>
  svg(size, <path d="M6.6 3.5h2.6l1.4 4-2 1.5a11.5 11.5 0 0 0 6.4 6.4l1.5-2 4 1.4v2.6c0 1.1-.9 2-2 2A16.4 16.4 0 0 1 4.6 5.5c0-1.1.9-2 2-2Z" fill="currentColor" stroke="none" />)

export const CalendarIcon = ({ size = 20 }: IconProps) =>
  svg(size, <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>)

export const GearIcon = ({ size = 20 }: IconProps) =>
  svg(size, <><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" /><circle cx="12" cy="12" r="6.6" /></>)

export const BellIcon = ({ size = 20 }: IconProps) =>
  svg(size, <><path d="M12 3a6 6 0 0 0-6 6v3.2c0 .6-.2 1.2-.6 1.7L4 16h16l-1.4-2.1c-.4-.5-.6-1.1-.6-1.7V9a6 6 0 0 0-6-6Z" /><path d="M9.5 19a2.5 2.5 0 0 0 5 0" /></>)

export const SearchIcon = ({ size = 16 }: IconProps) =>
  svg(size, <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.8-4.8" /></>)

export const ChevronRight = ({ size = 14 }: IconProps) =>
  svg(size, <path d="m9 5 7 7-7 7" strokeWidth="2.4" />)

export const ChevronLeft = ({ size = 20 }: IconProps) =>
  svg(size, <path d="m15 4-8 8 8 8" strokeWidth="2.6" />)

export const PinIcon = ({ size = 20 }: IconProps) =>
  svg(size, <path d="M12 2.5a7 7 0 0 0-7 7c0 5.2 7 12 7 12s7-6.8 7-12a7 7 0 0 0-7-7Zm0 9.6a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Z" fill="currentColor" stroke="none" />)

export const MailIcon = ({ size = 20 }: IconProps) =>
  svg(size, <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m3.8 6.5 8.2 6.5 8.2-6.5" /></>)

export const LinkIcon = ({ size = 20 }: IconProps) =>
  svg(size, <><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2" /><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" /></>)

export const CheckCircle = ({ size = 20 }: IconProps) =>
  svg(size, <><circle cx="12" cy="12" r="9.5" fill="currentColor" stroke="none" /><path d="m7.8 12.2 2.9 2.9 5.6-6" stroke="#fff" strokeWidth="2.2" /></>)

export const SidebarIcon = ({ size = 22 }: IconProps) =>
  svg(size, <><rect x="3" y="4.5" width="18" height="15" rx="3" /><path d="M9.5 4.5v15" /></>)

export const WaveformIcon = ({ size = 20 }: IconProps) =>
  svg(size, <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" strokeWidth="2" />)

export const SendIcon = ({ size = 20 }: IconProps) =>
  svg(size, <path d="M4 12 20 4l-6 16-3-7-7-1Z" />)
