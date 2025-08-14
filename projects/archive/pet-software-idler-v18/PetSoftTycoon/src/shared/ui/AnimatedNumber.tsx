import React, { useRef, useEffect } from 'react';
import { Animated, Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  formatter?: (value: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 300,
  style,
  formatter = (v) => v.toLocaleString(),
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value, duration]);
  
  return (
    <Animated.Text style={style}>
      {animatedValue.interpolate({
        inputRange: [0, value || 1],
        outputRange: ['0', formatter(value)],
        extrapolate: 'clamp',
      })}
    </Animated.Text>
  );
};