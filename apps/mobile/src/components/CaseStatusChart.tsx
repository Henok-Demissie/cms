import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import type { Palette } from '../theme';

/**
 * Donut of the tenant's complaint mix, drawn with react-native-svg.
 *
 * Not victory-native: the installed v41 is the Skia rewrite, which exports
 * CartesianChart/Pie and needs @shopify/react-native-skia. The old VictoryPie
 * this file used to import no longer exists, so it resolved to undefined and
 * crashed the staff dashboard on render. A ring of dashed circles needs no
 * charting library at all.
 */
export type CaseStatusChartProps = {
  newCount: number;
  ongoing: number;
  resolved: number;
  /**
   * Every complaint for the tenant. The three buckets above do not have to add
   * up to it — withdrawn and rejected ones are counted in neither — so the remainder
   * becomes its own slice and the ring stays honest about the total.
   */
  total: number;
};

const SIZE = 176;
const STROKE = 24;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

export function CaseStatusChart({ newCount, ongoing, resolved, total }: CaseStatusChartProps) {
  const { palette } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const other = Math.max(0, total - newCount - ongoing - resolved);
  const slices = [
    { label: 'New', value: newCount, color: palette.info },
    { label: 'In progress', value: ongoing, color: palette.warning },
    { label: 'Resolved', value: resolved, color: palette.success },
    { label: 'Withdrawn', value: other, color: palette.muted },
  ].filter((slice) => slice.value > 0);

  const counted = slices.reduce((sum, slice) => sum + slice.value, 0);

  // Walk the slices around the ring. Each one gives up a few pixels so the card
  // colour shows between them — unless there is only one, which would then be a
  // full ring with a nick in it for no reason.
  let cursor = 0;
  const arcs = slices.map((slice) => {
    const length = (slice.value / counted) * CIRCUMFERENCE;
    const start = cursor;
    cursor += length;
    return {
      ...slice,
      start,
      length: slices.length > 1 ? Math.max(length - GAP, 1) : length,
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complaint status distribution</Text>

      <View style={styles.chartWrapper}>
        <Svg width={SIZE} height={SIZE}>
          {/* Rotate so the first slice starts at the top rather than at 3 o'clock. */}
          <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={palette.surfaceRaised}
              strokeWidth={STROKE}
              fill="none"
            />
            {arcs.map((arc) => (
              <Circle
                key={arc.label}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={arc.color}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
                strokeDashoffset={-arc.start}
              />
            ))}
          </G>
        </Svg>

        <View style={styles.centerLabel} pointerEvents="none">
          <Text style={styles.centerValue}>{total}</Text>
          <Text style={styles.centerCaption}>{total === 1 ? 'complaint' : 'complaints'}</Text>
        </View>
      </View>

      {counted === 0 ? (
        <Text style={styles.empty}>No complaints yet.</Text>
      ) : (
        <View style={styles.legendContainer}>
          {slices.map((slice) => (
            <View key={slice.label} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
              <Text style={styles.legendText}>
                {slice.label}: {slice.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    container: {
      backgroundColor: p.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: p.border,
      marginVertical: 16,
    },
    title: {
      color: p.text,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'center',
    },
    chartWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerLabel: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerValue: {
      color: p.text,
      fontSize: 30,
      fontWeight: '800',
    },
    centerCaption: {
      color: p.muted,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    empty: {
      color: p.muted,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 12,
    },
    legendContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 12,
      gap: 12,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendColor: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    legendText: {
      color: p.text,
      fontSize: 13,
      fontWeight: '500',
    },
  });
