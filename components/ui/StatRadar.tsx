import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Line, Text as SvgText, G, Circle } from 'react-native-svg';
import { STAT_COLORS, COLORS, FONTS } from '../../constants/theme';
import { StatName } from '../../types';

const { width } = Dimensions.get('window');
const SIZE = width * 0.8;
const CENTER = SIZE / 2;
const RADIUS = (SIZE / 2) - 40;

type StatData = {
  name: StatName;
  value: number;
};

export default function StatRadar({ data }: { data: StatData[] }) {
  // Coordinates for the 6 points of the hexagon
  const angleStep = (Math.PI * 2) / 6;

  const getCoordinates = (val: number, i: number, radius: number) => {
    const r = (val / 100) * radius;
    const x = CENTER + r * Math.cos(i * angleStep - Math.PI / 2);
    const y = CENTER + r * Math.sin(i * angleStep - Math.PI / 2);
    return { x, y };
  };

  // Generate the points for the "User Shape"
  const points = data.map((d, i) => {
    const { x, y } = getCoordinates(d.value, i, RADIUS);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.container}>
      <Svg height={SIZE} width={SIZE}>
        <G>
          {/* Background Concentric Hexagons */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((tick) => {
            const hexPoints = data.map((_, i) => {
              const { x, y } = getCoordinates(100 * tick, i, RADIUS);
              return `${x},${y}`;
            }).join(' ');
            return (
              <Polygon
                key={tick}
                points={hexPoints}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis Lines */}
          {data.map((_, i) => {
            const { x, y } = getCoordinates(100, i, RADIUS);
            return (
              <Line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* THE DATA SHAPE */}
          <Polygon
            points={points}
            fill="rgba(255, 215, 0, 0.2)"
            stroke={COLORS.gold}
            strokeWidth="2"
          />

          {/* Stat Labels & Dots */}
          {data.map((d, i) => {
            const { x, y } = getCoordinates(115, i, RADIUS); // Offset for text
            const point = getCoordinates(d.value, i, RADIUS);
            
            return (
              <G key={d.name}>
                <Circle cx={point.x} cy={point.y} r="3" fill={STAT_COLORS[d.name]} />
                <SvgText
                  x={x}
                  y={y}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontFamily={FONTS.bodyBold}
                >
                  {d.name}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
});