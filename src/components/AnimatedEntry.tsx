/**
 * AnimatedEntry.tsx — Drop-in replacement for reanimated's entering animations
 * ==============================================================================
 * Uses React Native's built-in Animated API. Works perfectly in Expo Go.
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedEntryProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  slideFrom?: 'bottom' | 'top' | 'left' | 'right' | 'none';
  slideDistance?: number;
  style?: ViewStyle;
}

export function AnimatedEntry({
  children,
  delay = 0,
  duration = 600,
  slideFrom = 'bottom',
  slideDistance = 30,
  style,
}: AnimatedEntryProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(slideDistance)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const translateStyle = (() => {
    switch (slideFrom) {
      case 'bottom':
        return { translateY: translate };
      case 'top':
        return { translateY: Animated.multiply(translate, -1) };
      case 'left':
        return { translateX: Animated.multiply(translate, -1) };
      case 'right':
        return { translateX: translate };
      case 'none':
        return {};
    }
  })();

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [translateStyle as any].filter(
            (t) => Object.keys(t).length > 0,
          ),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * FadeIn — Simple opacity fade (no slide)
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 600,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}) {
  return (
    <AnimatedEntry
      delay={delay}
      duration={duration}
      slideFrom="none"
      style={style}
    >
      {children}
    </AnimatedEntry>
  );
}
