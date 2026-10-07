import React, { useState } from 'react';

export interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'mark' | 'full';
  showShimmer?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = 'w-10 h-10', 
  size = 40,
  variant = 'mark',
  showShimmer = true,
  onClick,
}) => {
  // Unique instance ID prefix to avoid gradient collisions if multiple logos render
  const id = React.useId().replace(/:/g, '');
  const [isHovered, setIsHovered] = useState(false);

  const emblemSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`shrink-0 select-none transition-transform duration-300 ${isHovered ? 'scale-105' : ''} ${className}`}
      role="img"
      aria-label="MAXIMUS Global Transport Link - Imperial Luxury Insignia"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <defs>
        {/* Deep Obsidian & Midnight Sapphire Enamel Radial Background */}
        <radialGradient id={`${id}-bg-radial`} cx="50%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#111F35" />
          <stop offset="38%" stopColor="#081324" />
          <stop offset="72%" stopColor="#040913" />
          <stop offset="100%" stopColor="#010307" />
        </radialGradient>

        {/* 24K Royal Bullion Gold (Primary High-Gloss Bevel) */}
        <linearGradient id={`${id}-gold-primary`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF7D6" />
          <stop offset="18%" stopColor="#F3D389" />
          <stop offset="42%" stopColor="#D4AC5B" />
          <stop offset="68%" stopColor="#A37E33" />
          <stop offset="86%" stopColor="#E2BE71" />
          <stop offset="100%" stopColor="#73511A" />
        </linearGradient>

        {/* Chiseled Champagne Mirror Light Facet */}
        <linearGradient id={`${id}-gold-light`} x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="25%" stopColor="#FFF1C7" />
          <stop offset="55%" stopColor="#E9C776" />
          <stop offset="85%" stopColor="#C49A47" />
          <stop offset="100%" stopColor="#966F26" />
        </linearGradient>

        {/* Chiseled Burnished Bronze Shadow Facet */}
        <linearGradient id={`${id}-gold-shadow`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B88E3E" />
          <stop offset="35%" stopColor="#7A561E" />
          <stop offset="70%" stopColor="#4A310C" />
          <stop offset="100%" stopColor="#241703" />
        </linearGradient>

        {/* Platinum Mirror Glare Gradient */}
        <linearGradient id={`${id}-platinum-glare`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Bezel Rim Metallic Fluting Gradient */}
        <linearGradient id={`${id}-bezel-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE8A3" />
          <stop offset="22%" stopColor="#A37C2D" />
          <stop offset="48%" stopColor="#F9DF98" />
          <stop offset="74%" stopColor="#6E4A14" />
          <stop offset="100%" stopColor="#E8C474" />
        </linearGradient>

        {/* Windshield Sapphire Tint with Champagne Reflection */}
        <linearGradient id={`${id}-windshield-tint`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1A30" />
          <stop offset="45%" stopColor="#132B4F" />
          <stop offset="75%" stopColor="#091424" />
          <stop offset="100%" stopColor="#030810" />
        </linearGradient>

        {/* Laser Headlight Forward Beam Projector */}
        <linearGradient id={`${id}-headlight-beam`} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#FFD166" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#E5A93C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C9A86A" stopOpacity="0" />
        </linearGradient>

        {/* Global Trade Orbit Meridian Arc */}
        <linearGradient id={`${id}-orbit-meridian`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A86A" stopOpacity="0.05" />
          <stop offset="25%" stopColor="#FF9F1C" stopOpacity="0.6" />
          <stop offset="55%" stopColor="#FFE28A" stopOpacity="0.95" />
          <stop offset="85%" stopColor="#D4AC5B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
        </linearGradient>

        {/* Wheel Turbine Metallic Gradient */}
        <radialGradient id={`${id}-wheel-metal`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#F1CE7D" />
          <stop offset="70%" stopColor="#A88133" />
          <stop offset="100%" stopColor="#4D350F" />
        </radialGradient>

        {/* Specular Ambient Drop Shadow Filter */}
        <filter id={`${id}-medallion-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000000" floodOpacity="0.85" />
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#C9A86A" floodOpacity="0.3" />
        </filter>

        {/* Diamond Glint Star Filter */}
        <filter id={`${id}-starburst`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Animated Specular Sweep Sheen */}
        <linearGradient id={`${id}-shimmer-sweep`} x1="-100%" y1="0%" x2="200%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="52%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ------------------------------------------------------------- */}
      {/* 1. LUXURY SQUIRCLE CUSHION MEDALLION BASE                     */}
      {/* ------------------------------------------------------------- */}
      
      {/* Shadow Base Foundation */}
      <rect
        x="5"
        y="6"
        width="110"
        height="110"
        rx="26"
        fill="#000000"
        opacity="0.9"
        filter={`url(#${id}-medallion-shadow)`}
      />

      {/* Obsidian & Midnight Sapphire Enamel Cushion */}
      <rect
        x="5"
        y="5"
        width="110"
        height="110"
        rx="26"
        fill={`url(#${id}-bg-radial)`}
        stroke={`url(#${id}-bezel-rim)`}
        strokeWidth="2.4"
      />

      {/* Precision Horology Hairline Inset Ring */}
      <rect
        x="9.5"
        y="9.5"
        width="101"
        height="101"
        rx="22"
        fill="none"
        stroke={`url(#${id}-gold-primary)`}
        strokeWidth="0.8"
        strokeOpacity="0.45"
      />

      {/* Micro-Corner Precision Vault Studs / Nautical Rivets */}
      <circle cx="15.5" cy="15.5" r="1.5" fill="#FFEAA8" opacity="0.8" />
      <circle cx="104.5" cy="15.5" r="1.5" fill="#FFEAA8" opacity="0.8" />
      <circle cx="15.5" cy="104.5" r="1.5" fill="#FFEAA8" opacity="0.8" />
      <circle cx="104.5" cy="104.5" r="1.5" fill="#FFEAA8" opacity="0.8" />

      {/* Cardinal Chronometer Index Marks at 12, 3, 6, 9 o'clock */}
      <line x1="60" y1="6" x2="60" y2="8.5" stroke="#FFEAA8" strokeWidth="1" strokeOpacity="0.8" />
      <line x1="60" y1="111.5" x2="60" y2="114" stroke="#FFEAA8" strokeWidth="1" strokeOpacity="0.8" />
      <line x1="6" y1="60" x2="8.5" y2="60" stroke="#FFEAA8" strokeWidth="1" strokeOpacity="0.8" />
      <line x1="111.5" y1="60" x2="114" y2="60" stroke="#FFEAA8" strokeWidth="1" strokeOpacity="0.8" />

      {/* Ambient Gold Heart Glow behind Monogram */}
      <ellipse cx="60" cy="52" rx="34" ry="24" fill="#C9A86A" opacity="0.1" />

      {/* ------------------------------------------------------------- */}
      {/* 2. CELESTIAL TRADE MERIDIAN (East Africa to Global Corridors)  */}
      {/* ------------------------------------------------------------- */}
      <path
        d="M 12 84 C 22 96, 50 102, 78 86 C 102 72, 110 46, 96 30 C 88 22, 74 24, 62 32"
        fill="none"
        stroke={`url(#${id}-orbit-meridian)`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="80 7"
        opacity="0.85"
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. ARCHITECTURAL 'M' MONOGRAM & CHISELED MONOLITHS            */}
      {/* ------------------------------------------------------------- */}
      <g>
        {/* === LEFT FREIGHT CONTAINER COLUMN (The West Pylon) === */}
        {/* Left Light Chamfer Facet */}
        <path
          d="M 18 28 
             L 26 21 
             L 26 84 
             L 18 84 
             Z"
          fill={`url(#${id}-gold-light)`}
        />
        {/* Right Shadow Chamfer Facet */}
        <path
          d="M 26 21 
             L 34 28 
             L 34 84 
             L 26 84 
             Z"
          fill={`url(#${id}-gold-shadow)`}
        />
        {/* Left Column Crown Bevel */}
        <polygon
          points="18,28 26,21 34,28 26,32"
          fill="#FFFBF0"
          opacity="0.9"
        />
        {/* Precision Laser-Etched Container Fluting / Guilloché Stripes */}
        <line x1="22" y1="36" x2="22" y2="80" stroke="#664614" strokeWidth="0.85" opacity="0.75" />
        <line x1="22.5" y1="36" x2="22.5" y2="80" stroke="#FFEAA8" strokeWidth="0.5" opacity="0.6" />
        <line x1="30" y1="36" x2="30" y2="80" stroke="#664614" strokeWidth="0.85" opacity="0.75" />
        <line x1="30.5" y1="36" x2="30.5" y2="80" stroke="#FFEAA8" strokeWidth="0.5" opacity="0.6" />


        {/* === CENTER IMPERIAL APEX & ESCROW V-CHEVRON === */}
        {/* Left Descending Diagonal Wing */}
        <path
          d="M 34 28 
             L 54 58 
             L 54 48 
             L 38 25 
             Z"
          fill={`url(#${id}-gold-light)`}
        />
        {/* Right Descending Diagonal Wing */}
        <path
          d="M 54 58 
             L 74 28 
             L 70 25 
             L 54 48 
             Z"
          fill={`url(#${id}-gold-shadow)`}
        />

        {/* Central Descending Keystone Keel */}
        <polygon
          points="54,48 60,57 60,67 54,58"
          fill={`url(#${id}-gold-light)`}
        />
        <polygon
          points="60,57 66,48 66,58 60,67"
          fill={`url(#${id}-gold-shadow)`}
        />

        {/* Ascending Imperial Crown Spearhead (Sovereignty & Velocity) */}
        <path
          d="M 60 15 
             L 70 30 
             L 60 26 
             Z"
          fill={`url(#${id}-gold-shadow)`}
        />
        <path
          d="M 60 15 
             L 60 26 
             L 50 30 
             Z"
          fill={`url(#${id}-gold-light)`}
        />
        <line x1="60" y1="15" x2="60" y2="26" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.9" />

        {/* Central Vault Escrow Keystone Diamond (Integrity Node) */}
        <polygon
          points="60,33 66,41 60,49 54,41"
          fill={`url(#${id}-gold-primary)`}
          stroke="#FFFDF5"
          strokeWidth="0.6"
        />
        {/* Diamond Interior Facets */}
        <polygon points="60,33 60,49 54,41" fill="#FFF4D0" opacity="0.8" />
        <polygon points="60,33 66,41 60,41" fill="#FFFFFF" opacity="0.6" />
        <polygon points="60,41 66,41 60,49" fill="#997028" opacity="0.9" />

        {/* Specular Starburst Sparkle on Escrow Diamond */}
        <g filter={`url(#${id}-starburst)`}>
          <path
            d="M 60 38 Q 60 41 63 41 Q 60 41 60 44 Q 60 41 57 41 Q 60 41 60 38 Z"
            fill="#FFFFFF"
          />
          <circle cx="60" cy="41" r="1" fill="#FFFDF8" />
        </g>


        {/* === RIGHT MONOLITH & AERODYNAMIC FREIGHT HAULER CAB === */}
        {/* Upper Container Segment */}
        <path
          d="M 74 28 
             L 82 21 
             L 90 28 
             L 90 48 
             L 74 48 
             Z"
          fill={`url(#${id}-gold-light)`}
        />
        <path
          d="M 82 21 
             L 90 28 
             L 90 48 
             L 82 48 
             Z"
          fill={`url(#${id}-gold-shadow)`}
        />
        {/* Right Column Top Crown Bevel */}
        <polygon
          points="74,28 82,21 90,28 82,32"
          fill="#FFFBF0"
          opacity="0.9"
        />
        {/* Laser Fluting on Upper Right Column */}
        <line x1="78" y1="34" x2="78" y2="46" stroke="#664614" strokeWidth="0.8" opacity="0.75" />
        <line x1="86" y1="34" x2="86" y2="46" stroke="#FFEAA8" strokeWidth="0.5" opacity="0.6" />

        {/* --- SCULPTED LUXURY TRUCK CAB (The Aerodynamic Hyper-Carrier) --- */}
        {/* Main Sculpted Hauler Body (x=70 to 98, y=48 to 84) */}
        <path
          d="M 70 48 
             L 90 48 
             L 98 62 
             L 98 84 
             L 70 84 
             Z"
          fill={`url(#${id}-gold-light)`}
          stroke={`url(#${id}-gold-primary)`}
          strokeWidth="0.5"
        />
        {/* Lower Front Bumper / Air Dam Shadow Facet */}
        <path
          d="M 88 64 
             L 98 64 
             L 98 84 
             L 88 84 
             Z"
          fill={`url(#${id}-gold-shadow)`}
        />

        {/* Aerodynamic Polarized Sapphire Windshield */}
        <path
          d="M 75 52 
             L 88 52 
             L 94 62 
             L 75 62 
             Z"
          fill={`url(#${id}-windshield-tint)`}
          stroke={`url(#${id}-gold-primary)`}
          strokeWidth="0.8"
        />
        {/* Windshield High-Gloss Mirror Reflection Glare */}
        <line 
          x1="78" 
          y1="54" 
          x2="88" 
          y2="60" 
          stroke={`url(#${id}-platinum-glare)`} 
          strokeWidth="1.4" 
          strokeLinecap="round" 
        />

        {/* Mirror-Gold Sun Visor / Aerodynamic Roof Wing */}
        <polygon
          points="73,49 91,49 89,52 73,52"
          fill="#FFF3CC"
        />

        {/* Precision Titanium & Gold Grille Louvers */}
        <line x1="76" y1="67" x2="94" y2="67" stroke="#543A11" strokeWidth="0.9" />
        <line x1="76" y1="67.5" x2="94" y2="67.5" stroke="#FFE6A3" strokeWidth="0.5" />
        <line x1="76" y1="71" x2="94" y2="71" stroke="#543A11" strokeWidth="0.9" />
        <line x1="76" y1="71.5" x2="94" y2="71.5" stroke="#FFE6A3" strokeWidth="0.5" />

        {/* High-Intensity Photon Projector Laser Headlight & Beam Vector */}
        <g filter={`url(#${id}-starburst)`}>
          {/* Forward Projected Light Cone */}
          <polygon
            points="98,73 112,69 114,77 98,75"
            fill={`url(#${id}-headlight-beam)`}
          />
          {/* Laser Headlight Crystal Lens */}
          <circle cx="96.5" cy="74" r="1.8" fill="#FFFFFF" />
          <circle cx="96.5" cy="74" r="2.8" fill="none" stroke="#FFE79A" strokeWidth="0.6" opacity="0.8" />
        </g>
      </g>

      {/* ------------------------------------------------------------- */}
      {/* 4. THREE HAUTE-HORLOGERIE CHRONOMETER WHEELS                  */}
      {/* (Left Cargo Wheel, Center Hub Wheel, Right Drive Wheel)        */}
      {/* ------------------------------------------------------------- */}
      
      {/* === WHEEL 1 (Left Pylon Base: x=26, y=89) === */}
      <g>
        {/* Obsidian Tread Tire */}
        <circle cx="26" cy="89" r="6" fill="#040913" stroke={`url(#${id}-gold-primary)`} strokeWidth="1.4" />
        {/* Inner Gold Alloy Rim */}
        <circle cx="26" cy="89" r="4.2" fill="none" stroke={`url(#${id}-gold-light)`} strokeWidth="0.8" />
        {/* Turbine Multi-Spoke Horology Flutes */}
        <circle cx="26" cy="89" r="3.2" fill={`url(#${id}-wheel-metal)`} />
        {/* Platinum Center Axle Gem */}
        <circle cx="26" cy="89" r="1.3" fill="#FFFFFF" />
        <circle cx="26" cy="89" r="0.6" fill="#1A2B42" />
      </g>

      {/* === WHEEL 2 (Center Keystone Base: x=54, y=89) === */}
      <g>
        {/* Obsidian Tread Tire */}
        <circle cx="54" cy="89" r="6" fill="#040913" stroke={`url(#${id}-gold-primary)`} strokeWidth="1.4" />
        {/* Inner Gold Alloy Rim */}
        <circle cx="54" cy="89" r="4.2" fill="none" stroke={`url(#${id}-gold-light)`} strokeWidth="0.8" />
        {/* Turbine Multi-Spoke Horology Flutes */}
        <circle cx="54" cy="89" r="3.2" fill={`url(#${id}-wheel-metal)`} />
        {/* Platinum Center Axle Gem */}
        <circle cx="54" cy="89" r="1.3" fill="#FFFFFF" />
        <circle cx="54" cy="89" r="0.6" fill="#1A2B42" />
      </g>

      {/* === WHEEL 3 (Right Freight Cab Base: x=86, y=89) === */}
      <g>
        {/* Obsidian Tread Tire */}
        <circle cx="86" cy="89" r="6" fill="#040913" stroke={`url(#${id}-gold-primary)`} strokeWidth="1.4" />
        {/* Inner Gold Alloy Rim */}
        <circle cx="86" cy="89" r="4.2" fill="none" stroke={`url(#${id}-gold-light)`} strokeWidth="0.8" />
        {/* Turbine Multi-Spoke Horology Flutes */}
        <circle cx="86" cy="89" r="3.2" fill={`url(#${id}-wheel-metal)`} />
        {/* Platinum Center Axle Gem */}
        <circle cx="86" cy="89" r="1.3" fill="#FFFFFF" />
        <circle cx="86" cy="89" r="0.6" fill="#1A2B42" />
      </g>


      {/* ------------------------------------------------------------- */}
      {/* 5. SOLID 24K GOLD BULLION HIGHWAY PLINTH (Ground Stability)   */}
      {/* ------------------------------------------------------------- */}
      {/* Sculpted Foundation Pedestal Ingot Bar */}
      <path
        d="M 14 96 
           L 106 96 
           L 102 101 
           L 18 101 
           Z"
        fill={`url(#${id}-gold-shadow)`}
        stroke={`url(#${id}-gold-primary)`}
        strokeWidth="0.6"
      />
      {/* Foundation Ingot Chamfer Light Ridge */}
      <path
        d="M 14 96 
           L 106 96 
           L 104 98 
           L 16 98 
           Z"
        fill={`url(#${id}-gold-light)`}
        opacity="0.85"
      />
      {/* Platinum Glare Specular Highlight Line */}
      <line 
        x1="22" 
        y1="97" 
        x2="98" 
        y2="97" 
        stroke={`url(#${id}-platinum-glare)`} 
        strokeWidth="1.1" 
      />

      {/* Navigation Satellite Diamond Glint at Orbital Zenith */}
      <g filter={`url(#${id}-starburst)`}>
        <circle cx="96" cy="30" r="1.6" fill="#FFFFFF" />
        <circle cx="96" cy="30" r="3" fill="none" stroke="#FFEAA8" strokeWidth="0.5" opacity="0.6" />
      </g>
    </svg>
  );

  if (variant === 'mark') {
    return emblemSvg;
  }

  // Full Brand Crest Variant: Emblem + Royal Serif Typography & Tagline
  return (
    <div 
      className={`inline-flex items-center gap-3.5 group select-none cursor-pointer ${className}`}
      onClick={onClick}
    >
      {emblemSvg}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="text-[20px] font-black tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#E8C477] to-[#C9A86A] drop-shadow-sm font-sans">
            MAXIMUS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#9E7835] via-[#E6C37A] to-[#FFF4D0] shadow-sm shadow-[#C9A86A]/70 animate-pulse"></span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[9.5px] font-bold tracking-[0.24em] uppercase text-amber-200/90 font-mono">
            GLOBAL TRANSPORT LINK
          </span>
          <span className="text-[8px] text-amber-400/50">✦</span>
          <span className="text-[8.5px] tracking-[0.16em] uppercase text-amber-100/60 font-mono hidden sm:inline">
            EST. 2026
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
