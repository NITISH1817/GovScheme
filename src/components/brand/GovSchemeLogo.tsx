import React from 'react';
import { GovSchemeLogoMark } from './GovSchemeLogoMark';

export interface LogoProps {
  className?: string;
  markSize?: number;
  textColor?: string;
  animateHover?: boolean;
  hideWordmarkOnMobile?: boolean;
}

export const GovSchemeLogo: React.FC<LogoProps> = ({
  className = '',
  markSize = 36,
  textColor = 'text-[#123C69] dark:text-white',
  animateHover = true,
  hideWordmarkOnMobile = false
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <GovSchemeLogoMark size={markSize} animate={animateHover} />
      <span 
        className={`font-bold font-sans tracking-tight ${textColor} ${hideWordmarkOnMobile ? 'hidden sm:block' : ''}`}
        style={{ fontSize: `${markSize * 0.65}px` }}
      >
        GovScheme
      </span>
    </div>
  );
};
