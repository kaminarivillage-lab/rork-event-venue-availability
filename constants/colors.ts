export const AutumnColors = {
  cream: '#FBF7F4',
  terracotta: '#D4958E',
  dustyRose: '#E8B4B8',
  sage: '#B5C4A5',
  warmGray: '#9D9289',
  softBrown: '#C8ADA0',
  paleGold: '#E8D7C3',
  mutedOrange: '#E5A47F',
  brown: '#6B4E3D',
  rust: '#C85A3C',
  green: '#7AA874',
  lightGreen: '#C8DFC8',
  gold: '#D4AF37',
};

export type DateStatus = 'available' | 'on-hold' | 'booked';

export const StatusColors: Record<DateStatus, string> = {
  available: '#C8DFC8',
  'on-hold': '#F4B084',
  booked: '#D98880',
};

const tintColorLight = AutumnColors.terracotta;

export default {
  light: {
    text: '#3D3935',
    background: AutumnColors.cream,
    tint: tintColorLight,
    tabIconDefault: AutumnColors.warmGray,
    tabIconSelected: tintColorLight,
  },
};
