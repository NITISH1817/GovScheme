import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { GovSchemeLogoLoader } from './brand';

interface AIAnalysisProps {
  onComplete: () => void;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [schemesFound, setSchemesFound] = useState(0);

  const steps = [
    { label: "YOUR PROFILE", text: "Profile analyzed" },
    { label: "ELIGIBILITY RULES", text: "Location & Income checked" },
    { label: "SCHEME DATABASE", text: "State & Central schemes verified" },
    { label: "MATCHING ENGINE", text: "Requirements crossed-checked" },
    { label: "RECOMMENDATIONS", text: "Matches ranked by relevance" }
  ];

  useEffect(() => {
    let stepTimer: NodeJS.Timeout | undefined;
    
    const runSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setCurrentStep(i + 1);
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
      setShowResults(true);
      
      let count = 0;
      const counterInterval = setInterval(() => {
        count += 1;
        setSchemesFound(count);
        if (count >= 18) {
          clearInterval(counterInterval);
        }
      }, 50);
    };
    
    runSteps();
    
    return () => clearTimeout(stepTimer);
  }, [steps.length]);

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center py-20 bg-white dark:bg-[#07111F]">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto flex flex-col"
          >
            <div className="mb-12 text-center flex flex-col items-center">
              <div className="mb-6">
                <GovSchemeLogoLoader size={64} />
              </div>
              <h2 className="text-3xl font-bold text-gov-navy dark:text-white font-sans tracking-tight">
                Finding schemes relevant to you
              </h2>
            </div>

            <div className="flex flex-col items-center">
              {steps.map((step, index) => {
                const isCompleted = currentStep > index;
                const isCurrent = currentStep === index;
                
                return (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center w-full max-w-xs">
                      <div className={`w-full p-4 rounded border flex items-center justify-between transition-colors duration-300 ${isCompleted ? 'bg-gov-background dark:bg-[#0F1B2D] border-gov-green/20' : isCurrent ? 'bg-white dark:bg-[#16243A] border-gov-blue/50 shadow-sm' : 'bg-transparent border-transparent opacity-50'}`}>
                        <span className={`text-sm font-bold tracking-wider ${isCompleted || isCurrent ? 'text-gov-navy dark:text-white' : 'text-gov-textMuted dark:text-gray-500'}`}>
                          {step.label}
                        </span>
                        {isCompleted && <Check className="w-4 h-4 text-gov-green" />}
                        {isCurrent && <div className="w-3 h-3 rounded-full bg-gov-blue animate-pulse" />}
                      </div>
                      
                      {isCompleted && (
                        <div className="text-xs text-gov-textMuted dark:text-gray-400 mt-2 mb-1 text-center">
                          ✓ {step.text}
                        </div>
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className="flex flex-col items-center justify-center h-10 w-full overflow-hidden">
                        <motion.div 
                          className={`w-px h-full ${isCompleted ? 'bg-gov-blue' : 'bg-gov-border dark:bg-white/10'}`}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.8 }}
                          style={{ originY: 0 }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            
            {currentStep === steps.length && (
              <div className="text-center mt-8 text-gov-navy dark:text-white font-medium animate-pulse">
                Matching schemes...
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto flex flex-col items-center text-center p-8 rounded-xl bg-white dark:bg-[#0F1B2D] border border-gov-border dark:border-white/10 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-gov-green/10 flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-gov-green" />
            </div>

            <h2 className="text-2xl font-bold text-gov-navy dark:text-white font-sans tracking-tight mb-2">
              Analysis Complete
            </h2>
            
            <div className="flex items-baseline justify-center gap-2 mb-8">
              <span className="text-5xl font-black text-gov-navy dark:text-white tabular-nums">{schemesFound}</span>
              <span className="text-sm font-medium text-gov-textMuted dark:text-gray-400">schemes found</span>
            </div>

            <button
              onClick={onComplete}
              className="w-full rounded bg-gov-blue text-white font-bold py-3 px-4 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              View My Recommendations
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
