import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-10 h-10', size = 40 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`rounded-xl shrink-0 ${className}`}
      role="img"
      aria-label="MAXIMUS Transport Logo"
    >
      <defs>
        {/* Background dark container fill */}
        <linearGradient id="maximusBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B192C" />
          <stop offset="100%" stopColor="#050C16" />
        </linearGradient>

        {/* Vivid Orange Container Gradient */}
        <linearGradient id="truckOrangeGrad" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#FFA726" />
          <stop offset="40%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>

        {/* Metallic chrome cab accent */}
        <linearGradient id="cabAccentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Rounded Dark Container Background */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="22"
        fill="url(#maximusBgGrad)"
        stroke="#FF8C00"
        strokeWidth="2.5"
        strokeOpacity="0.35"
      />

      {/* M-SHAPED FREIGHT CONTAINER & TRUCK CAB CONCEPT */}
      {/* Outer stylized 'M' silhouette formed by twin cargo container pillars joined by a central chevron */}
      {/* Left Cargo Container Pillar (M left leg) */}
      <path
        d="M 18 25
           L 32 25
           L 32 75
           L 18 75
           Z"
        fill="url(#truckOrangeGrad)"
      />
      {/* Container corrugated ridges (left pillar) */}
      <line x1="22" y1="30" x2="22" y2="70" stroke="#CC5500" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="30" x2="28" y2="70" stroke="#CC5500" strokeWidth="1.5" strokeLinecap="round" />

      {/* Center V-Peak / Chute of the M */}
      <path
        d="M 32 25
           L 50 48
           L 68 25
           L 60 25
           L 50 38
           L 40 25
           Z"
        fill="#FFA726"
      />

      {/* Central Cargo Tie-Down Anchor in the M valley */}
      <polygon points="50,44 43,32 57,32" fill="#E65100" />

      {/* Right Cargo Container Pillar (M right leg) */}
      <path
        d="M 68 25
           L 82 25
           L 82 52
           L 68 52
           Z"
        fill="url(#truckOrangeGrad)"
      />
      {/* Container corrugated ridges (right pillar) */}
      <line x1="72" y1="30" x2="72" y2="48" stroke="#CC5500" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="78" y1="30" x2="78" y2="48" stroke="#CC5500" strokeWidth="1.5" strokeLinecap="round" />

      {/* FORWARD TRUCK CAB (integrating seamlessly into the lower right of the M) */}
      {/* Cab Body */}
      <path
        d="M 62 52
           L 82 52
           L 88 64
           L 88 75
           L 62 75
           Z"
        fill="url(#truckOrangeGrad)"
      />
      {/* Truck Windshield / Aerodynamic Visor */}
      <path
        d="M 67 55
           L 79 55
           L 84 63
           L 67 63
           Z"
        fill="#0B192C"
        stroke="#FFA726"
        strokeWidth="1"
      />
      {/* Windshield glare */}
      <line x1="70" y1="57" x2="76" y2="61" stroke="url(#cabAccentGrad)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Headlight beam indicator */}
      <circle cx="86" cy="68" r="2" fill="#FFFBEB" />
      <line x1="88" y1="68" x2="94" y2="68" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

      {/* HEAVY DUTY WHEELS & ROAD BASE */}
      {/* Front Cab Wheel */}
      <circle cx="78" cy="76" r="6" fill="#0F172A" stroke="#FF8C00" strokeWidth="2" />
      <circle cx="78" cy="76" r="2.5" fill="#E2E8F0" />

      {/* Middle Tandem Wheel */}
      <circle cx="50" cy="76" r="6" fill="#0F172A" stroke="#FF8C00" strokeWidth="2" />
      <circle cx="50" cy="76" r="2.5" fill="#E2E8F0" />

      {/* Rear Container Wheel */}
      <circle cx="26" cy="76" r="6" fill="#0F172A" stroke="#FF8C00" strokeWidth="2" />
      <circle cx="26" cy="76" r="2.5" fill="#E2E8F0" />

      {/* Speed / Highway Motion Line */}
      <line x1="12" y1="84" x2="88" y2="84" stroke="#FF8C00" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
};
export default Logo;
