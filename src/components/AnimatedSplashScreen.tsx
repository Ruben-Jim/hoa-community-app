import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as SplashScreen from 'expo-splash-screen';

// Keep native splash screen visible while we load the video
SplashScreen.preventAutoHideAsync();

// Constants
const MIN_DISPLAY_TIME = 2000; // 2 seconds minimum display time
const FADE_OUT_DURATION = 400; // 400ms fade-out animation
const VIDEO_LOAD_TIMEOUT = 10000; // 10 seconds to attempt video load (give video more time to load)
const VIDEO_END_CHECK_INTERVAL = 100; // Check every 100ms for video end
const VIDEO_END_THRESHOLD = 0.3; // 300ms threshold for detecting video end
const STATIC_SPLASH_MIN_TIME = 1500; // Minimum time to show static splash (ensures it's visible)

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
  const [videoLoadAttempted, setVideoLoadAttempted] = useState(false);
  const startTime = useRef<number>(Date.now()); // Track when component mounts
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const videoEndDetected = useRef(false);
  const videoLoadStartTime = useRef<number>(Date.now());
  const playerRef = useRef<any>(null);
  const staticSplashShownTime = useRef<number>(Date.now());

  // Handle video source - expo-video can handle require() numbers directly
  const videoUri = typeof videoSource === 'object' && 'uri' in videoSource 
    ? videoSource.uri 
    : typeof videoSource === 'number'
    ? videoSource // require() returns a number, expo-video handles it directly
    : videoSource;

  // Log video source for debugging
  useEffect(() => {
    console.log('[Splash] Video source type:', typeof videoSource, 'URI type:', typeof videoUri);
  }, [videoSource, videoUri]);

  // Create video player with expo-video
  // Note: useVideoPlayer must be called unconditionally (React hooks rule)
  const player = useVideoPlayer(videoUri, (player) => {
    // Configure player for fast loading
    player.loop = false;
    player.muted = true;
    playerRef.current = player;
    console.log('[Splash] Video player created');
    
    // Force video to start loading immediately
    // The video should auto-load, but we can help it along
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

  // Preload and play video when ready - check more frequently for faster detection
  useEffect(() => {
    if (!player || hasError || useFallback || !videoLoadAttempted) return;

    // Check if video has loaded (duration > 0 means metadata is loaded)
    const isReady = player.duration > 0;
    
    if (isReady && !isVideoReady) {
      console.log('[Splash] Video loaded successfully, duration:', player.duration);
      setIsVideoReady(true);
      // Hide native splash once video is ready to play
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors if splash is already hidden
      });
      // Start playing the video immediately
      try {
        player.play();
        console.log('[Splash] Video playback started - will fade out when video completes');
        // Reset start time to when video actually starts playing
        startTime.current = Date.now();
      } catch (error) {
        console.error('[Splash] Error playing video:', error);
        setHasError(true);
        setUseFallback(true);
        // Hide native splash and show static fallback
        SplashScreen.hideAsync().catch(() => {});
      }
    }
  }, [player?.duration, isVideoReady, player, hasError, useFallback, videoLoadAttempted]);

  // More aggressive video loading check - poll more frequently
  useEffect(() => {
    if (!player || hasError || useFallback || !videoLoadAttempted || isVideoReady) return;

    // Check every 100ms for faster detection
    const checkInterval = setInterval(() => {
      if (player.duration > 0 && !isVideoReady) {
        console.log('[Splash] Video detected ready via polling, duration:', player.duration);
        setIsVideoReady(true);
        SplashScreen.hideAsync().catch(() => {});
        try {
          player.play();
          startTime.current = Date.now();
        } catch (error) {
          console.error('[Splash] Error playing video:', error);
          setHasError(true);
          setUseFallback(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    }, 100); // Check every 100ms for faster detection

    return () => clearInterval(checkInterval);
  }, [player, hasError, useFallback, videoLoadAttempted, isVideoReady]);

  // Silently handle video errors - just switch to fallback without warnings
  useEffect(() => {
    if (!player || hasError || useFallback || !videoLoadAttempted) return;

    // Check if video failed to load after a reasonable time
    const checkVideoStatus = setTimeout(() => {
      if (!isVideoReady && !hasError && !useFallback) {
        // If video hasn't loaded after timeout, silently use fallback
        if (player.duration === 0 && Date.now() - videoLoadStartTime.current > VIDEO_LOAD_TIMEOUT) {
          setUseFallback(true);
          setIsVideoReady(true);
        }
      }
    }, VIDEO_LOAD_TIMEOUT + 500); // Give it a bit more time than the initial timeout

    return () => clearTimeout(checkVideoStatus);
  }, [isVideoReady, hasError, useFallback, player?.duration, videoLoadAttempted]);

  // Optimized video end detection with minimum display time
  useEffect(() => {
    if (!player || hasFinished || !isVideoReady || hasError || useFallback || videoEndDetected.current) return;

    const checkVideoEnd = () => {
      // Check if video has finished playing
      if (player.duration > 0 && player.currentTime > 0) {
        // Video is finished if we're at or very close to the end
        const timeRemaining = player.duration - player.currentTime;
        const isVideoFinished = timeRemaining <= VIDEO_END_THRESHOLD;
        
        if (isVideoFinished && !videoEndDetected.current) {
          videoEndDetected.current = true;
          console.log('[Splash] Video finished playing, preparing to fade out');
          
          // Calculate elapsed time and ensure minimum display time
          const elapsed = Date.now() - startTime.current;
          const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsed);
          
          // Wait for minimum display time, then fade out
          setTimeout(() => {
            if (!hasFinished) {
              console.log('[Splash] Fading out after video completion');
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

    // Check at optimized interval to detect when video ends
    const interval = setInterval(checkVideoEnd, VIDEO_END_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [player?.currentTime, player?.duration, player?.playing, onFinish, hasFinished, isVideoReady, hasError, useFallback, fadeAnim]);

  // Attempt to load video - but gracefully fallback to static splash if it takes too long
  useEffect(() => {
    // Mark that we've attempted to load video
    setVideoLoadAttempted(true);
    videoLoadStartTime.current = Date.now();
    staticSplashShownTime.current = Date.now();
    
    // Keep native splash visible until video loads or we use fallback
    // Don't hide it immediately - let video load first

    // Set a timeout to decide if we should use fallback
    // Give video plenty of time to load before falling back
    const loadTimeout = setTimeout(() => {
      if (!isVideoReady && !hasError && !useFallback) {
        // Check one more time if video has loaded
        if (player && player.duration > 0) {
          // Video actually loaded, just wasn't detected - trigger it now
          console.log('[Splash] Video found after timeout, duration:', player.duration);
          setIsVideoReady(true);
          SplashScreen.hideAsync().catch(() => {});
          try {
            player.play();
            startTime.current = Date.now();
          } catch (error) {
            console.error('[Splash] Error playing video after timeout:', error);
            setUseFallback(true);
            setIsVideoReady(true);
            SplashScreen.hideAsync().catch(() => {});
            staticSplashShownTime.current = Date.now();
          }
        } else {
          // Video really didn't load, use fallback
          console.log('[Splash] Video did not load after', VIDEO_LOAD_TIMEOUT, 'ms, using static splash');
          setUseFallback(true);
          setIsVideoReady(true); // Mark as ready so we can proceed with static splash
          
          // Hide native splash and show static fallback
          SplashScreen.hideAsync().catch(() => {});
          
          // Reset the static splash shown time to now, so we ensure minimum display time
          staticSplashShownTime.current = Date.now();
        }
      }
    }, VIDEO_LOAD_TIMEOUT);

    return () => {
      clearTimeout(loadTimeout);
    };
  }, []); // Only run once on mount

  // Handle completion - if video fails, proceed directly to app
  useEffect(() => {
    if (hasFinished) return;

    // If video failed to load, proceed directly to app (no static splash fallback)
    if (useFallback || hasError) {
      const elapsed = Date.now() - staticSplashShownTime.current;
      const remainingTime = Math.max(0, STATIC_SPLASH_MIN_TIME - elapsed);
      
      const timeout = setTimeout(() => {
        if (!hasFinished) {
          setIsFadingOut(true);
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

      return () => clearTimeout(timeout);
    }
  }, [useFallback, hasError, hasFinished, fadeAnim, onFinish]);

  // Show video with cover fit - video has built-in animation, only fade-out is animated
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Video with cover fit - uses built-in animation from splash-icon.mp4 */}
      {!useFallback && !hasError && isVideoReady && player && player.duration > 0 ? (
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
        />
      ) : null}
      {/* Keep native splash visible while video loads or if it fails */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});

