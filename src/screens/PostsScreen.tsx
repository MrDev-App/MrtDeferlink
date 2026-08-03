import { Dimensions, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Svg, { Path } from 'react-native-svg';

const CURVE_HEIGHT = 140;
const CURVE_DEPTH = 70;

const { width, height } = Dimensions.get('window');
const heightX = height / 2;
const widthX = width / 2;
const BOX_SIZE = 60;

const coverTextScale = 3;
const fullScreenScale = (Math.max(width, height) * 1.5) / BOX_SIZE;

const PostsScreen = () => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-heightX);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const continueY = useSharedValue(200);

  const continueAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: continueY.value }],
  }));

  console.log('width', width, 'height');

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      scale.value,
      [1, coverTextScale],
      ['#2C8358', '#ffffff'],
    ),
  }));

  const animate = () => {
    translateY.value = withSpring(
      translateY.value === 0 ? -heightX : 0,
      { damping: 6, stiffness: 180, mass: 0.4 },
      finished => {
        if (finished) {
          scale.value = withSpring(
            scale.value === 1 ? coverTextScale : 1,
            { damping: 6, stiffness: 180, mass: 0.4 },
            finished2 => {
              if (finished2) {
                scale.value = withDelay(
                  100,
                  withSpring(
                    fullScreenScale,
                    { damping: 6, stiffness: 180, mass: 0.4 },
                    finished3 => {
                      if (finished3) {
                        continueY.value = withSpring(0, {
                          damping: 10,
                          stiffness: 40,
                          mass: 0.2,
                        });
                      }
                    },
                  ),
                );
              }
            },
          );
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, animatedStyle]} />
      <Animated.Text style={[styles.text, textAnimatedStyle]} onPress={animate}>
        Splash
      </Animated.Text>

      <Animated.View style={[styles.continueViewOuter, continueAnimatedStyle]}>
        <Svg
          width={width}
          height={CURVE_HEIGHT}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={`M0,0 Q${
              width / 2
            },${CURVE_DEPTH} ${width},0 L${width},${CURVE_HEIGHT} L0,${CURVE_HEIGHT} Z`}
            fill="#ffffff"
          />
        </Svg>

        <View style={styles.continueView}>
          <Text style={styles.continueText}>Continue</Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default PostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 60,
    height: 60,
    backgroundColor: '#2C8358',
    borderRadius: 60,
  },
  text: {
    position: 'absolute',
    color: '#2C8358',
    fontSize: 34,
    fontWeight: '900',
  },

  continueViewOuter: {
    width: '100%',
    height: 140,
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  continueView: {
    width: '60%',
    backgroundColor: '#2C8358',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  continueText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
});
