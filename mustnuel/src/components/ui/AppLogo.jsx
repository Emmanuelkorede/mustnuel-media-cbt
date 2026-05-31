

export default function AppLogo({ size = 40, wordmark = false, className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* ---- SVG Icon ---- */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ExamEdge logo"
      >
        <defs>
          {/* Smooth drop shadow for the icon layers to give it depth */}
          <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 1. Central Circle Ring (Now using a semi-transparent blue) */}
        <g transform="translate(50, 50)">
          {/* The thin visible outer border ring */}
          <circle cx="0" cy="0" r="44" fill="none" stroke="#1b5ee4" strokeWidth="1.5" opacity="0.35" />
          {/* The subtle blue transparent fill inside the ring */}
          <circle cx="0" cy="0" r="44" fill="#1b5ee4" opacity="0.04" />
          
          {/* 2. The Vibrant Blue Graduation Cap */}
          <g filter="url(#logo-shadow)" transform="translate(0, 1)">
            
            {/* Base / Neck cylinder under the cap */}
            <path 
              d="M -14,4
                 C -14,10 -7,12 0,12 
                 C 7,12 14,10 14,4 
                 L 14,9 
                 C 14,14.5 7,17.5 0,17.5 
                 C -7,17.5 -14,14.5 -14,9 Z" 
              fill="#1b5ee4" 
            />
            
            {/* Seamless Tassel dropping on the right */}
            <path 
              d="M 0,-9 
                 L 24,1 
                 L 24,12 
                 C 24,13.5 22,13.5 22,12 
                 L 22,2.5 Z" 
              fill="#1b5ee4" 
            />
            
            {/* Rounded Diamond Top (Mortarboard) */}
            <path 
              d="M -28,-2 
                 C -30,-3 -30,-4.8 -28,-5.8
                 L -2,-16
                 C -0.8,-16.5 0.8,-16.5 2,-16 
                 L 28,-5.8 
                 C 30,-4.8 30,-3 28,-2 
                 L 2,8 
                 C 0.8,8.5 -0.8,8.5 -2,8 Z" 
              fill="#1b5ee4" 
            />
            
          </g>
        </g>
      </svg>

      {/* ---- Wordmark (Brand Name) ---- */}
      {wordmark && (
        <span
          className="text-xl font-bold tracking-tight text-slate-900 dark:text-white select-none"
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          Mustnuel's Media
        </span>
      )}
    </div>
  );
}