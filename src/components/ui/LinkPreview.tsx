import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { encode } from "qss";
import React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "../../lib/utils";

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  layout?: string;
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

export const LinkPreview = ({
  children,
  url,
  className,
  width = 200,
  height = 125,
  isStatic = false,
  imageSrc = "",
}: LinkPreviewProps) => {
  const src = React.useMemo(() => {
    if (isStatic) return imageSrc;
    
    const params = encode({
      url,
      screenshot: true,
      meta: false,
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": true,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": width * 3,
      "viewport.height": height * 3,
    });
    return `https://api.microlink.io/?${params}`;
  }, [url, width, height, isStatic, imageSrc]);

  const [isOpen, setOpen] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  
  React.useEffect(() => {
    setImageLoaded(false);
  }, [url]);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const translateX = useSpring(x, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2;
    x.set(offsetFromCenter);
  };

  return (
    <HoverCardPrimitive.Root
      openDelay={50}
      closeDelay={100}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setImageLoaded(false);
        }
      }}
    >
      <HoverCardPrimitive.Trigger
        onMouseMove={handleMouseMove}
        className={cn("text-white", className)}
        asChild
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </HoverCardPrimitive.Trigger>

      <HoverCardPrimitive.Content
        className="[transform-origin:var(--radix-hover-card-content-transform-origin)]"
        side="top"
        align="center"
        sideOffset={10}
        style={{ zIndex: 1000 }}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.6 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                },
              }}
              exit={{ opacity: 0, y: 20, scale: 0.6 }}
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                x: translateX,
              }}
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '4px',
                  background: '#1E293B',
                  border: '2px solid #334155',
                  borderRadius: '12px',
                  fontSize: 0,
                }}
              >
                {!imageLoaded && (
                  <div 
                    style={{ 
                      width, 
                      height, 
                      borderRadius: '8px',
                      background: 'linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748B',
                      fontSize: '12px',
                    }}
                  >
                    Loading...
                  </div>
                )}
                <img
                  src={src}
                  width={width}
                  height={height}
                  style={{ 
                    borderRadius: '8px',
                    display: imageLoaded ? 'block' : 'none',
                  }}
                  alt="preview image"
                  onLoad={() => setImageLoaded(true)}
                />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Root>
  );
};
