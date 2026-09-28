import React from 'react';
import { motion } from 'framer-motion';
import { GovSchemeLogoMark } from './GovSchemeLogoMark';

export interface LogoLoaderProps {
  text?: string;
  className?: string;
  size?: number;
}

export const GovSchemeLogoLoader: React.FC<LogoLoaderProps> = ({ 
  text = 'Loading...', 
  className = '',
  size = 48
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <motion.div
        animate={{ 
          opacity: [0.7, 1, 0.7],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <GovSchemeLogoMark size={size} />
      </motion.div>
      {text && (
        <motion.div 
          className="text-sm font-semibold text-gray-500 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {text}
        </motion.div>
      )}
    </div>
  );
};
