import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Animated, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as SplashScreen from 'expo-splash-screen';

// Keep native splash screen visible while we load the video
SplashScreen.preventAutoHideAsync();

// Constants
const MIN_DISPLAY_TIME = 2000; // 2 seconds minimum display time
const FADE_OUT_DURATION = 400; // 400ms fade-out animation
const VIDEO_LOAD_TIMEOUT = 5000; // 5 seconds timeout for video loading
const VIDEO_END_CHECK_INTERVAL = 100; // Check every 100ms for video end
const VIDEO_END_THRESHOLD = 0.3; // 300ms threshold for detecting video end

interface AnimatedSplashScreenProps {
  onFinish: () => void;
  videoSource: any; // require() for local, or { uri: '...' } for remote
}

export default function AnimatedSplashScreen({ 
  onFinish, 
  videoSource
}: AnimatedSplashScreenProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const startTime = useRef<number>(Date.now()); // Track when component mounts
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const videoEndDetected = useRef(false);
  const videoLoadStartTime = useRef<number>(Date.now());
  const playerRef = useRef<any>(null);

  // Handle video source - expo-video expects a string URI
  // For local files with require(), we need to get the URI
  const videoUri = typeof videoSource === 'object' && 'uri' in videoSource 
    ? videoSource.uri 
    : typeof videoSource === 'number'
    ? videoSource // require() returns a number, expo-video handles it
    : videoSource;

  // Log video source for debugging
  useEffect(() => {
    console.log('[Splash] Video source type:', typeof videoSource, 'URI:', videoUri);
  }, [videoSource, videoUri]);

  // Create video player with expo-video
  // Note: useVideoPlayer must be called unconditionally (React hooks rule)
  const player = useVideoPlayer(videoUri, (player) => {
    // Configure player
    player.loop = false;
    // Mute the video (splash screens typically don't have sound)
    player.muted = true;
    playerRef.current = player;
    console.log('[Splash] Video player created');
  });

  // Monitor for player creation errors
  useEffect(() => {
    // If player doesn't have duration after a short time, it might have failed
    const checkPlayerError = setTimeout(() => {
      if (!player || (player.duration === 0 && Date.now() - videoLoadStartTime.current > 1000)) {
        // Player might have failed to initialize
        console.warn('[Splash] Video player may have failed to initialize');
      }
    }, 1000);

    return () => clearTimeout(checkPlayerError);
  }, [player]);

  // Preload and play video when ready
  useEffect(() => {
    if (!player || hasError || useFallback) return;

    if (player.duration > 0 && !isVideoReady) {
      console.log('[Splash] Video loaded successfully, duration:', player.duration);
      setIsVideoReady(true);
      // Hide native splash once video is ready
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors if splash is already hidden
      });
      // Start playing the video
      // Note: expo-video's play() doesn't return a promise, so we use try-catch
      try {
        player.play();
        console.log('[Splash] Video playback started');
      } catch (error) {
        console.error('[Splash] Error playing video:', error);
        setHasError(true);
        setUseFallback(true);
      }
    }
  }, [player?.duration, isVideoReady, player, hasError, useFallback]);

  // Monitor video player status for better error detection
  useEffect(() => {
    if (!player || hasError || useFallback) return;

    // Check if video is actually playing after a short delay
    const checkVideoStatus = setTimeout(() => {
      if (!isVideoReady && !hasError) {
        // If video hasn't loaded after 2 seconds, likely an error
        if (player.duration === 0 && Date.now() - videoLoadStartTime.current > 2000) {
          console.warn('[Splash] Video failed to load properly, using fallback');
          setHasError(true);
          setUseFallback(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    }, 2000);

    return () => clearTimeout(checkVideoStatus);
  }, [isVideoReady, hasError, useFallback, player?.duration]);

  // Optimized video end detection with minimum display time
  useEffect(() => {
    if (!player || hasFinished || !isVideoReady || hasError || useFallback || videoEndDetected.current) return;

    const checkVideoEnd = () => {
      // Check if video has finished
      if (player.duration > 0 && player.currentTime > 0) {
        // Video is finished if we're at or very close to the end and not playing
        const timeRemaining = player.duration - player.currentTime;
        const isVideoFinished = timeRemaining <= VIDEO_END_THRESHOLD && !player.playing;
        
        if (isVideoFinished && !videoEndDetected.current) {
          videoEndDetected.current = true;
          
          // Calculate elapsed time and ensure minimum display time
          const elapsed = Date.now() - startTime.current;
          const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);
          
          // Wait for minimum display time, then fade out
          setTimeout(() => {
            if (!hasFinished) {
              setIsFadingOut(true);
              // Fade out animation
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: FADE_OUT_DURATION,
                useNativeDriver: true,
              }).start(() => {
                setHasFinished(true);
                onFinish();
              });
            }
          }, remainingTime);
        }
      }
    };

    // Check at optimized interval
    const interval = setInterval(checkVideoEnd, VIDEO_END_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [player?.currentTime, player?.duration, player?.playing, onFinish, hasFinished, isVideoReady, hasError, useFallback, fadeAnim]);

  // Improved error handling with fallback to static splash
  useEffect(() => {
    if (hasError || useFallback) return;

    // Timeout for video loading - use fallback if video doesn't load
    const loadTimeout = setTimeout(() => {
      if (!isVideoReady && !hasError && !useFallback) {
        console.warn('[Splash] Video taking too long to load, using static splash fallback');
        setHasError(true);
        setUseFallback(true);
        setIsVideoReady(true);
        SplashScreen.hideAsync().catch(() => {});
        
        // Show static splash for minimum time, then proceed
        const elapsed = Date.now() - startTime.current;
        const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);
        
        setTimeout(() => {
          setIsFadingOut(true);
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: FADE_OUT_DURATION,
            useNativeDriver: true,
          }).start(() => {
            setHasFinished(true);
            onFinish();
          });
        }, remainingTime);
      }
    }, VIDEO_LOAD_TIMEOUT);

    // Monitor for video playback errors
    const errorCheckInterval = setInterval(() => {
      if (!player || hasError || useFallback) return;
      
      // Check if video player is in an error state
      // Note: expo-video doesn't expose error state directly, so we check duration
      if (isVideoReady && player.duration === 0 && Date.now() - startTime.current > 2000) {
        // Video should have loaded by now, likely an error
        if (!hasError && !useFallback) {
          console.warn('[Splash] Video playback error detected, using static splash fallback');
          setHasError(true);
          setUseFallback(true);
          videoEndDetected.current = true;
          
          const elapsed = Date.now() - startTime.current;
          const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);
          
          setTimeout(() => {
            setIsFadingOut(true);
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: FADE_OUT_DURATION,
              useNativeDriver: true,
            }).start(() => {
              setHasFinished(true);
              onFinish();
            });
          }, remainingTime);
        }
      }
    }, 500);

    return () => {
      clearTimeout(loadTimeout);
      clearInterval(errorCheckInterval);
    };
  }, [isVideoReady, onFinish, hasError, useFallback, player?.duration, fadeAnim]);

  // Always show static splash image as background, video overlays if available
  // This ensures something is always visible
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Static splash image as base layer */}
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.fallbackImage}
        resizeMode="contain"
      />
      
      {/* Video overlay if available and ready */}
      {!useFallback && !hasError && isVideoReady && player ? (
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          fullscreenOptions={{ enterFullscreenButtonHidden: true }}
        />
      ) : (
        // Loading indicator while video loads (over static image)
        !hasFinished && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  fallbackImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

