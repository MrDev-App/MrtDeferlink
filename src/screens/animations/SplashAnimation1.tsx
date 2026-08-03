// AnimatedSplashTransition.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  WithSpringConfig,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

export interface AnimatedSplashTransitionProps {
  /** Text or icon rendered as the trigger — anything measurable via onLayout */
  content: React.ReactNode;
  /** Called when the trigger is pressed */
  onTriggerPress?: () => void;
  /** Called once the full sequence completes */
  onComplete?: () => void;

  /** Brand color of the expanding circle / curve / button */
  color?: string;
  /** Text/icon color before the circle covers it */
  initialContentColor?: string;
  /** Text/icon color after the circle covers it */
  revealedContentColor?: string;

  /** Diameter of the initial circle before it expands */
  circleSize?: number;
  /** Extra margin added around content when computing cover scale (px) */
  coverPadding?: number;
  /** Height of the bottom curve area */
  curveHeight?: number;
  /** Depth of the curve dip (bigger = more pronounced swoop) */
  curveDepth?: number;
  /** How much the circle shrinks back vertically to reveal the curve */
  shrinkBackScaleY?: number;

  /** Bottom action button label; omit to hide the button entirely */
  buttonLabel?: string;
  onButtonPress?: () => void;

  /** Fine-tune spring feel without touching animation logic */
  springConfig?: WithSpringConfig;

  style?: ViewStyle;
  contentTextStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
}

const DEFAULT_SPRING: WithSpringConfig = {
  damping: 6,
  stiffness: 180,
  mass: 0.4,
};

/** Renders the bottom curve as a single continuous bezier — memoized since
 *  it only depends on layout dimensions, not the animation frame. */
const BottomCurve = React.memo(function BottomCurve({
  width,
  height,
  depth,
  fill,
}: {
  width: number;
  height: number;
  depth: number;
  fill: string;
}) {
  const path = `M0,0 Q${
    width / 2
  },${depth} ${width},0 L${width},${height} L0,${height} Z`;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      <Path d={path} fill={fill} />
    </Svg>
  );
});

export default function SplashAnimation1({
  content,
  onTriggerPress,
  onComplete,
  color = '#2C8358',
  initialContentColor = '#2C8358',
  revealedContentColor = '#ffffff',
  circleSize = 60,
  coverPadding = 24,
  curveHeight = 140,
  curveDepth = 70,
  shrinkBackScaleY = 0.75,
  buttonLabel = 'Continue',
  onButtonPress,
  springConfig = DEFAULT_SPRING,
  style,
  contentTextStyle,
  buttonStyle,
  buttonTextStyle,
}: AnimatedSplashTransitionProps) {
  const { width, height } = useWindowDimensions(); // responsive to rotation/resize
  const halfHeight = height / 2;

  const [contentSize, setContentSize] = useState({ w: 0, h: 0 });

  const translateY = useSharedValue(-halfHeight);
  const scale = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const buttonY = useSharedValue(200);

  // Minimum circle scale needed to cover the content's bounding diagonal
  const coverScale = useMemo(() => {
    if (contentSize.w === 0) return 1;
    const diagonal = Math.sqrt(contentSize.w ** 2 + contentSize.h ** 2);
    return (diagonal + coverPadding * 2) / circleSize;
  }, [contentSize, coverPadding, circleSize]);

  const fullScreenScale = useMemo(
    () => (Math.max(width, height) * 1.5) / circleSize,
    [width, height, circleSize],
  );

  const handleContentLayout = useCallback((e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    setContentSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { scaleY: scaleY.value },
    ],
  }));

  const contentColorStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      scale.value,
      [1, coverScale],
      [initialContentColor, revealedContentColor],
    ),
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: buttonY.value }],
  }));

  const handleTriggerPress = useCallback(() => {
    onTriggerPress?.();

    translateY.value = withSpring(
      translateY.value === 0 ? -halfHeight : 0,
      springConfig,
      dropFinished => {
        'worklet';
        if (!dropFinished) return;

        scale.value = withSpring(
          scale.value === 1 ? coverScale : 1,
          springConfig,
          coverFinished => {
            'worklet';
            if (!coverFinished) return;

            scale.value = withDelay(
              100,
              withSpring(fullScreenScale, springConfig, spreadFinished => {
                'worklet';
                if (!spreadFinished) return;

                scaleY.value = withDelay(
                  500,
                  withSpring(shrinkBackScaleY, springConfig, shrinkFinished => {
                    'worklet';
                    if (!shrinkFinished) return;

                    buttonY.value = withSpring(
                      0,
                      { damping: 10, stiffness: 120, mass: 0.5 },
                      buttonFinished => {
                        'worklet';
                        if (buttonFinished && onComplete) {
                          onComplete();
                        }
                      },
                    );
                  }),
                );
              }),
            );
          },
        );
      },
    );
  }, [
    halfHeight,
    coverScale,
    fullScreenScale,
    shrinkBackScaleY,
    springConfig,
    onTriggerPress,
    onComplete,
    translateY,
    scale,
    scaleY,
    buttonY,
  ]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize,
            backgroundColor: color,
          },
          circleStyle,
        ]}
      />

      <View onLayout={handleContentLayout}>
        {typeof content === 'string' ? (
          <Animated.Text
            onPress={handleTriggerPress}
            style={[styles.contentText, contentTextStyle, contentColorStyle]}
          >
            {content}
          </Animated.Text>
        ) : (
          <View onTouchEnd={handleTriggerPress}>{content}</View>
        )}
      </View>

      {buttonLabel ? (
        <Animated.View
          style={[
            styles.curveOuter,
            { height: curveHeight },
            buttonAnimatedStyle,
          ]}
        >
          <BottomCurve
            width={width}
            height={curveHeight}
            depth={curveDepth}
            fill="#ffffff"
          />
          <View
            style={[styles.button, { backgroundColor: color }, buttonStyle]}
          >
            <Text
              style={[styles.buttonText, buttonTextStyle]}
              onPress={onButtonPress}
            >
              {buttonLabel}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    // top pinned so scaleY shrinks only from the bottom, matching design
    // transformOrigin requires RN 0.71+ / Reanimated 3+
    transformOrigin: 'top',
  },
  contentText: {
    fontSize: 34,
    fontWeight: '900',
  },
  curveOuter: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    width: '60%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
});
