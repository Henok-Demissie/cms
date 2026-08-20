import { View, Text, StyleSheet } from 'react-native';
import { VictoryPie } from 'victory-native';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import type { Palette } from '../theme';

// Example data – replace with your real status counts
const data = [
  { x: 'Pending', y: 12 },
  { x: 'In Progress', y: 8 },
  { x: 'Resolved', y: 20 },
  { x: 'Escalated', y: 5 },
];

export function CaseStatusChart() {
  const { palette } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const total = data.reduce((sum, d) => sum + d.y, 0);
  const colors = [palette.primary, palette.warning, palette.info, palette.danger];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Case Status Distribution</Text>

      <View style={styles.chartWrapper}>
        <VictoryPie
          data={data}
          colorScale={colors}
          radius={({ datum }) => (datum.y / total) * 120 + 40}
          innerRadius={50}
          labelRadius={({ datum }) => (datum.y / total) * 120 + 55}
          style={{
            labels: {
              fill: palette.text,
              fontSize: 12,
              fontWeight: '600',
            },
            data: {
              // Slice separator: match the card the chart sits on, not the screen.
              stroke: palette.surface,
              strokeWidth: 2,
            },
          }}
          labelPlacement="vertical"
          labelPosition="centroid"
        />
      </View>

      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors[index] }]} />
            <Text style={styles.legendText}>
              {item.x}: {item.y}
            </Text>
          </View>
        ))}
      </View>
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
