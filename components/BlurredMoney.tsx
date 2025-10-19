import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { usePrivacy } from '@/contexts/PrivacyContext';

interface BlurredMoneyProps {
  amount: number | string;
  style?: TextStyle | TextStyle[];
  prefix?: string;
  suffix?: string;
}

export default function BlurredMoney({ amount, style, prefix = '€', suffix = '' }: BlurredMoneyProps) {
  const { isMoneyBlurred } = usePrivacy();

  const formattedAmount = typeof amount === 'number' 
    ? amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount;

  const displayText = `${prefix}${formattedAmount}${suffix}`;

  return (
    <Text style={[style, isMoneyBlurred && styles.blurred]}>
      {displayText}
    </Text>
  );
}

const styles = StyleSheet.create({
  blurred: {
    color: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
});
