// src/indicators.ts

export interface IndicatorSettings {
  // Input settings
  length: number;
  smoothingLine: 'SMA' | 'EMA';
  smoothingLength: number;

  // Time interval settings
  timeIntervals: {
    minutes: { enabled: boolean; min: number; max: number };
    hours: { enabled: boolean; min: number; max: number };
    days: { enabled: boolean; min: number; max: number };
    weeks: { enabled: boolean; min: number; max: number };
    months: { enabled: boolean; min: number; max: number };
  };

  // Style settings
  plot: {
    visible: boolean;
    color: string;
    lineStyle: 'solid' | 'dashed';
  };
  smoothedMA: {
    visible: boolean;
    color: string;
    lineStyle: 'solid' | 'dashed';
  };
  upperLimit: {
    visible: boolean;
    color: string;
    lineStyle: 'dashed';
    value: number;
  };
  middleLimit: {
    visible: boolean;
    color: string;
    lineStyle: 'dashed';
    value: number;
  };
  lowerLimit: {
    visible: boolean;
    color: string;
    lineStyle: 'dashed';
    value: number;
  };
  hlinesBackground: boolean;
  showLabels: boolean;
  showValues: boolean;
}

export const defaultSettings: { [key: string]: IndicatorSettings } = {
  rsi: {
    length: 14,
    smoothingLine: 'SMA',
    smoothingLength: 14,
    timeIntervals: {
      minutes: { enabled: true, min: 1, max: 59 },
      hours: { enabled: true, min: 1, max: 24 },
      days: { enabled: true, min: 1, max: 366 },
      weeks: { enabled: true, min: 1, max: 52 },
      months: { enabled: true, min: 1, max: 12 },
    },
    plot: {
      visible: true,
      color: '#7E57C2',
      lineStyle: 'solid',
    },
    smoothedMA: {
      visible: true,
      color: '#FF5252',
      lineStyle: 'solid',
    },
    upperLimit: {
      visible: true,
      color: '#FF9800',
      lineStyle: 'dashed',
      value: 70,
    },
    middleLimit: {
      visible: true,
      color: '#FFB74D',
      lineStyle: 'dashed',
      value: 50,
    },
    lowerLimit: {
      visible: true,
      color: '#81C784',
      lineStyle: 'dashed',
      value: 30,
    },
    hlinesBackground: true,
    showLabels: true,
    showValues: true,
  },
  sma: {
    length: 14,
    smoothingLine: 'SMA',
    smoothingLength: 14,
    timeIntervals: {
      minutes: { enabled: true, min: 1, max: 59 },
      hours: { enabled: true, min: 1, max: 24 },
      days: { enabled: true, min: 1, max: 366 },
      weeks: { enabled: true, min: 1, max: 52 },
      months: { enabled: true, min: 1, max: 12 },
    },
    plot: {
      visible: true,
      color: '#00BCD4',
      lineStyle: 'solid',
    },
    smoothedMA: {
      visible: false,
      color: '#FF5252',
      lineStyle: 'solid',
    },
    upperLimit: {
      visible: false,
      color: '#FF9800',
      lineStyle: 'dashed',
      value: 70,
    },
    middleLimit: {
      visible: false,
      color: '#FFB74D',
      lineStyle: 'dashed',
      value: 50,
    },
    lowerLimit: {
      visible: false,
      color: '#81C784',
      lineStyle: 'dashed',
      value: 30,
    },
    hlinesBackground: false,
    showLabels: true,
    showValues: true,
  },
  ema: {
    length: 14,
    smoothingLine: 'SMA',
    smoothingLength: 14,
    timeIntervals: {
      minutes: { enabled: true, min: 1, max: 59 },
      hours: { enabled: true, min: 1, max: 24 },
      days: { enabled: true, min: 1, max: 366 },
      weeks: { enabled: true, min: 1, max: 52 },
      months: { enabled: true, min: 1, max: 12 },
    },
    plot: {
      visible: true,
      color: '#FFD700',
      lineStyle: 'solid',
    },
    smoothedMA: {
      visible: false,
      color: '#FF5252',
      lineStyle: 'solid',
    },
    upperLimit: {
      visible: false,
      color: '#FF9800',
      lineStyle: 'dashed',
      value: 70,
    },
    middleLimit: {
      visible: false,
      color: '#FFB74D',
      lineStyle: 'dashed',
      value: 50,
    },
    lowerLimit: {
      visible: false,
      color: '#81C784',
      lineStyle: 'dashed',
      value: 30,
    },
    hlinesBackground: false,
    showLabels: true,
    showValues: true,
  },
};

export const indicators = [
  {
    id: 'rsi',
    label: 'RSI',
    separateChart: true,
    settings: defaultSettings.rsi,
  },
  {
    id: 'sma',
    label: 'SMA',
    separateChart: false,
    settings: defaultSettings.sma,
  },
  {
    id: 'ema',
    label: 'EMA',
    separateChart: false,
    settings: defaultSettings.ema,
  },
];
