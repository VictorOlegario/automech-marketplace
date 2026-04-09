import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 18,
  interactive = false,
  onRate,
  showValue = true,
}) => {
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const filled = i <= Math.round(rating);
    const star = (
      <TouchableOpacity
        key={i}
        disabled={!interactive}
        onPress={() => onRate?.(i)}
        activeOpacity={interactive ? 0.7 : 1}
      >
        <Text style={{ fontSize: size, color: filled ? '#F59E0B' : '#D1D5DB' }}>
          {filled ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    );
    stars.push(star);
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>{stars}</View>
      {showValue && <Text style={[styles.value, { fontSize: size * 0.8 }]}>{rating.toFixed(1)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  starsRow: { flexDirection: 'row' },
  value: { marginLeft: 4, color: '#6B7280', fontWeight: '600' },
});
