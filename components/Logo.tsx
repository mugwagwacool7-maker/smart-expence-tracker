import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/store';

// Gold "P" coin: gentle pulse + a shine that sweeps across every few seconds
export function Logo({ size = 32, showName = false }: { size?: number; showName?: boolean }) {
  const shine = useRef(new Animated.Value(0)).current, pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(shine, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(shine, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
    ])).start();
  }, []);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });
  const x = shine.interpolate({ inputRange: [0, 1], outputRange: [-size, size * 1.5] });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Animated.View style={{ transform: [{ scale }], width: size, height: size, borderRadius: size / 2, backgroundColor: '#F59E0B', borderWidth: size * 0.08, borderColor: '#FCD34D', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <Text style={{ fontSize: size * 0.55, fontWeight: '900', color: '#78350F' }}>P</Text>
        <Animated.View style={{ position: 'absolute', top: -size * 0.2, width: size * 0.3, height: size * 1.4, backgroundColor: 'rgba(255,255,255,0.55)', transform: [{ translateX: x }, { rotate: '20deg' }] }} />
      </Animated.View>
      {showName && <Text style={{ color: C.text, fontSize: size * 0.6, fontWeight: '800' }}>Penny<Text style={{ color: '#F59E0B' }}>wise</Text></Text>}
    </View>
  );
}

// Animated splash: coin pops in and spins, the name fades in, then everything fades out
export function Splash({ onDone }: { onDone: () => void }) {
  const pop = useRef(new Animated.Value(0)).current, flip = useRef(new Animated.Value(0)).current;
  const txt = useRef(new Animated.Value(0)).current, out = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }),
        Animated.timing(flip, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(txt, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(out, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => onDone());
  }, []);
  const rotateY = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });
  return (
    <Animated.View style={{ ...StyleSheet.absoluteFill, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', opacity: out }}>
      <Animated.View style={{ transform: [{ scale: pop }, { perspective: 800 }, { rotateY }] }}><Logo size={120} /></Animated.View>
      <Animated.View style={{ opacity: txt, marginTop: 24, alignItems: 'center' }}>
        <Text style={{ color: '#F1F5F9', fontSize: 34, fontWeight: '800' }}>Penny<Text style={{ color: '#F59E0B' }}>wise</Text></Text>
        <Text style={{ color: '#94A3B8', marginTop: 4 }}>Every penny counts</Text>
      </Animated.View>
    </Animated.View>
  );
}
