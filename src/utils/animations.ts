import { Animated, Easing } from 'react-native';

// Modern animation configurations
export const AnimationConfig = {
  // Spring animations for natural feel
  spring: {
    tension: 100,
    friction: 8,
    useNativeDriver: true,
  },
  
  // Timing animations for smooth transitions
  timing: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
  
  // Quick animations for micro-interactions
  quick: {
    duration: 150,
    easing: Easing.out(Easing.quad),
    useNativeDriver: true,
  },
  
  // Slow animations for dramatic effects
  slow: {
    duration: 500,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
};

// Common animation functions
export const createFadeIn = (value: Animated.Value, delay = 0) => {
  return Animated.timing(value, {
    toValue: 1,
    delay,
    ...AnimationConfig.timing,
  });
};

export const createFadeOut = (value: Animated.Value, delay = 0) => {
  return Animated.timing(value, {
    toValue: 0,
    delay,
    ...AnimationConfig.timing,
  });
};

export const createSlideIn = (value: Animated.Value, fromY = -50, delay = 0) => {
  return Animated.timing(value, {
    toValue: 0,
    delay,
    ...AnimationConfig.timing,
  });
};

export const createSlideOut = (value: Animated.Value, toY = -50, delay = 0) => {
  return Animated.timing(value, {
    toValue: toY,
    delay,
    ...AnimationConfig.timing,
  });
};

export const createScaleIn = (value: Animated.Value, delay = 0) => {
  return Animated.spring(value, {
    toValue: 1,
    delay,
    ...AnimationConfig.spring,
  });
};

export const createScaleOut = (value: Animated.Value, delay = 0) => {
  return Animated.timing(value, {
    toValue: 0,
    delay,
    ...AnimationConfig.quick,
  });
};

export const createBounceIn = (value: Animated.Value, delay = 0) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.1,
      delay,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  ]);
};

export const createShake = (value: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: -10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 10, duration: 50, useNativeDriver: true }),
    Animated.timing(value, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};

// Stagger animation for multiple elements
export const createStaggeredAnimation = (animations: Animated.CompositeAnimation[], stagger = 100) => {
  return Animated.stagger(stagger, animations);
};

// Pulse animation for loading states
export const createPulse = (value: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1.2,
        duration: 800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ])
  );
};
