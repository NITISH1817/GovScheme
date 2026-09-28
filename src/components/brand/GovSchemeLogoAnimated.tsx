import React from 'react';
import { motion } from 'framer-motion';
import { GovSchemeLogoMark } from './GovSchemeLogoMark';

export interface AnimatedLogoProps {
  onComplete?: () => void;
  className?: string;
}

export const GovSchemeLogoAnimated: React.FC<AnimatedLogoProps> = ({ 
  onComplete,
  className = '' 
}) => {
  return (
    <motion.div 
      className={`flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#07111F] ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="relative flex flex-col items-center">
        {/* Ambient light sweep behind logo */}
        <motion.div 
          className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0.3 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Logo Mark drawing itself */}
        <GovSchemeLogoMark size={120} animatedDraw={true} />
        
        {/* Wordmark fading in */}
        <motion.div
          className="mt-6 text-4xl font-bold text-[#123C69] dark:text-white font-sans tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
          onAnimationComplete={() => {
            if (onComplete) {
              setTimeout(onComplete, 800);
            }
          }}
        >
          GovScheme
        </motion.div>
      </div>
      
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,60,105,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(18,60,105,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
    </motion.div>
  );
};
