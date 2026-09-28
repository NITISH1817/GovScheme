import React from 'react';
import { motion } from 'framer-motion';

export interface LogoMarkProps {
  className?: string;
  size?: number;
  animate?: boolean;
  animatedDraw?: boolean;
  color?: string;
  accentColor?: string;
}

export const GovSchemeLogoMark: React.FC<LogoMarkProps> = ({ 
  className = '', 
  size = 40, 
  animate = false,
  animatedDraw = false,
  color = 'currentColor', // #123C69 officially
  accentColor = '#F97316' // Saffron accent
}) => {
  
  // Base SVG paths based on the official GovScheme geometry
  // Represents the overlapping hexagonal 'G' bridge structure
  const path1 = "M49.5 12L22 28V60L49.5 76L65 67V50H45V62"; // Left-to-center inner G
  const path2 = "M50.5 88L78 72V40L50.5 24L35 33V50H55V38"; // Right-to-center wrapping

  // Saffron accent connectors
  const accent1 = "M45 15L55 21";
  const accent2 = "M55 85L45 79";

  const drawVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: custom * 0.3, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay: custom * 0.3, duration: 0.1 }
      }
    })
  };

  const hoverAnimation = animate ? {
    scale: [1, 1.03, 1],
    transition: { duration: 0.3, ease: 'easeInOut' }
  } : {};

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      whileHover={hoverAnimation}
      initial={animatedDraw ? "hidden" : "visible"}
      animate="visible"
    >
      {/* Saffron accents */}
      <motion.path
        d={accent1}
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        custom={2}
        variants={animatedDraw ? drawVariants : {}}
      />
      <motion.path
        d={accent2}
        stroke={accentColor}
        strokeWidth="6"
        strokeLinecap="round"
        custom={2.2}
        variants={animatedDraw ? drawVariants : {}}
      />

      {/* Main Navy Geometry */}
      <motion.path
        d={path1}
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        custom={0}
        variants={animatedDraw ? drawVariants : {}}
      />
      <motion.path
        d={path2}
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        custom={1}
        variants={animatedDraw ? drawVariants : {}}
      />
      
      {/* Dots/nodes at the end of the G paths to signify 'tech/connection' */}
      <motion.circle 
        cx="45" cy="62" r="5" fill={color}
        initial={animatedDraw ? { scale: 0 } : { scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ delay: animatedDraw ? 1.5 : 0, type: 'spring' }}
      />
      <motion.circle 
        cx="55" cy="38" r="5" fill={color}
        initial={animatedDraw ? { scale: 0 } : { scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ delay: animatedDraw ? 1.8 : 0, type: 'spring' }}
      />
    </motion.svg>
  );
};
