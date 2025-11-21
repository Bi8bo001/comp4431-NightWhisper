import React, { useMemo } from 'react';

interface AnimatedBackgroundProps {
  backgroundImage: string;
  children: React.ReactNode;
  enhanced?: boolean; // Enhanced mode for landing screen
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  backgroundImage,
  children,
  enhanced = false,
}) => {
  // Generate floating stars/bubbles - use useMemo to stabilize generation
  const starCount = enhanced ? 25 : 8;
  const stars = useMemo(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: `star-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      size: enhanced ? `${Math.random() * 14 + 8}px` : `${Math.random() * 8 + 4}px`,
      twinkle: Math.random() > 0.3, // More stars twinkle
    }));
  }, [starCount, enhanced]);

  // Generate bubbles - only in enhanced mode
  const bubbles = useMemo(() => {
    if (!enhanced) return [];
    return Array.from({ length: 8 }, (_, i) => ({
      id: `bubble-${i}`,
      left: `${Math.random() * 100}%`,
      initialBottom: `${Math.random() * 100}%`, // Start from random height
      delay: `${i * 2}s`, // Stagger them more evenly
      size: `${Math.random() * 60 + 40}px`, // Bigger bubbles
      duration: `${15 + Math.random() * 10}s`, // Varying speeds
    }));
  }, [enhanced]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-navy/40"></div>
      </div>

      {/* Floating stars - dynamic animations */}
      {stars.map((star) => {
        // Use CSS keyframe names directly
        const animationName = star.twinkle
          ? 'starTwinkle 2s ease-in-out infinite, starFloatSlow 8s ease-in-out infinite'
          : 'starFloat 6s ease-in-out infinite';

        return (
          <div
            key={star.id}
            className={`absolute rounded-full ${
              star.twinkle 
                ? enhanced 
                  ? 'bg-white/50 shadow-lg shadow-white/30' 
                  : 'bg-white/40 shadow-md shadow-white/20'
                : enhanced
                  ? 'bg-white/30'
                  : 'bg-white/25'
            }`}
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              filter: enhanced ? 'blur(0.5px)' : 'blur(1px)',
              animation: animationName,
              animationDelay: star.delay,
              willChange: 'transform, opacity',
            }}
          />
        );
      })}

      {/* Bubbles (only in enhanced mode) - floating bubbles distributed in air */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full border-2 border-white/20 bg-white/8 backdrop-blur-sm shadow-sm"
          style={{
            left: bubble.left,
            bottom: bubble.initialBottom, // Start from random height
            width: bubble.size,
            height: bubble.size,
            animation: `bubbleFloat ${bubble.duration} ease-in-out infinite`,
            animationDelay: bubble.delay,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

