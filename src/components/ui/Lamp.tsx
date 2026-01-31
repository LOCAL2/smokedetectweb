import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { useTheme } from "../../context/ThemeContext";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { isDark } = useTheme();
  
  
  const bgColor = isDark ? 'bg-slate-950' : 'bg-slate-100';
  const maskBgColor = isDark ? 'bg-slate-950' : 'bg-slate-100';
  const glowColor = isDark ? 'from-cyan-500' : 'from-blue-500';
  const glowColorTo = isDark ? 'to-cyan-500' : 'to-blue-500';
  const lineColor = isDark ? 'bg-cyan-400' : 'bg-blue-400';
  const blurColor = isDark ? 'bg-cyan-500' : 'bg-blue-400';
  const blurColor2 = isDark ? 'bg-cyan-400' : 'bg-blue-300';

  return (
    <div
      className={cn(
        `relative flex flex-col items-center overflow-hidden w-full rounded-md z-0 pt-16 pb-8`,
        bgColor,
        className
      )}
    >
      {}
      <div className="relative flex w-full h-[180px] items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          animate={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className={cn(
            "absolute inset-auto right-1/2 h-40 overflow-visible w-[30rem] bg-gradient-conic via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]",
            glowColor
          )}
        >
          <div className={cn("absolute w-[100%] left-0 h-28 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]", maskBgColor)} />
          <div className={cn("absolute w-40 h-[100%] left-0 bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]", maskBgColor)} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          animate={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className={cn(
            "absolute inset-auto left-1/2 h-40 w-[30rem] bg-gradient-conic from-transparent via-transparent text-white [--conic-position:from_290deg_at_center_top]",
            glowColorTo
          )}
        >
          <div className={cn("absolute w-40 h-[100%] right-0 bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]", maskBgColor)} />
          <div className={cn("absolute w-[100%] right-0 h-28 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]", maskBgColor)} />
        </motion.div>
        <div className={cn("absolute top-1/2 h-32 w-full translate-y-8 scale-x-150 blur-2xl", maskBgColor)}></div>
        <div className="absolute top-1/2 z-50 h-32 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className={cn("absolute inset-auto z-50 h-24 w-[28rem] -translate-y-1/2 rounded-full opacity-50 blur-3xl", blurColor)}></div>
        <motion.div
          initial={{ width: "8rem" }}
          animate={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className={cn("absolute inset-auto z-30 h-24 w-64 -translate-y-[4rem] rounded-full blur-2xl", blurColor2)}
        ></motion.div>
        <motion.div
          initial={{ width: "15rem" }}
          animate={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className={cn("absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[5rem]", lineColor)}
        ></motion.div>

        <div className={cn("absolute inset-auto z-40 h-32 w-full -translate-y-[9rem]", maskBgColor)}></div>
      </div>

      {}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-[100] flex flex-col items-center px-5 -mt-6 pb-8"
      >
        {children}
      </motion.div>
    </div>
  );
};
