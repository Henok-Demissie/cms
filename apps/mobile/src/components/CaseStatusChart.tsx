import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryPie, VictoryLegend } from 'victory-native';
import { palette } from '../theme';

const { width } = Dimensions.get('window');

// Example data – replace with your real status counts
const data = [
  { x: 'Pending', y: 12 },
  { x: 'In Progress', y: 8 },
  { x: 'Resolved', y: 20 },
  { x: 'Escalated', y: 5 },
];

const colors = ['#45d6a1', '#fbbf24', '#60a5fa', '#ff6b6b'];

export function CaseStatusChart() {
  const total = data.reduce((sum, d) => sum + d.y, 0);

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
              stroke: palette.bg,
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    marginVertical: 16,
  },
  title: {
    color: palette.text,
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
    color: palette.text,
    fontSize: 13,
    fontWeight: '500',
  },
});
