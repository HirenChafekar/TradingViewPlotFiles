import React from 'react';
import { Modal, Tabs, Input, Select, Button, Switch, ColorPicker, Slider } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { IndicatorSettings } from '../indicators';

interface IndicatorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: IndicatorSettings) => void;
  initialSettings?: IndicatorSettings;
}

const { TabPane } = Tabs;

const IndicatorSettingsModal: React.FC<IndicatorSettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings = {
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
}) => {
  const [settings, setSettings] = React.useState<IndicatorSettings>(initialSettings);
  const prevInitialSettingsRef = React.useRef(initialSettings);

  React.useEffect(() => {
    if (JSON.stringify(prevInitialSettingsRef.current) !== JSON.stringify(initialSettings)) {
      setSettings(initialSettings);
      prevInitialSettingsRef.current = initialSettings;
    }
  }, [initialSettings]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const renderStyleItem = (
    label: string,
    visible: boolean,
    color: string,
    lineStyle: string,
    onUpdate: (updates: any) => void,
    value?: number
  ) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <Switch
        checked={visible}
        onChange={(checked) => onUpdate({ visible: checked })}
      />
      <span style={{ minWidth: '100px' }}>{label}</span>
      <ColorPicker
        value={color}
        onChange={(color: Color) => onUpdate({ color: color.toHexString() })}
      />
      <Select
        value={lineStyle}
        style={{ width: 100 }}
        onChange={(value) => onUpdate({ lineStyle: value })}
      >
        <Select.Option value="solid">Solid</Select.Option>
        <Select.Option value="dashed">Dashed</Select.Option>
      </Select>
      {value !== undefined && (
        <Input
          type="number"
          value={value}
          style={{ width: 80 }}
          onChange={(e) => onUpdate({ value: parseFloat(e.target.value) })}
        />
      )}
    </div>
  );

  const renderTimeIntervalItem = (
    label: string,
    interval: { enabled: boolean; min: number; max: number },
    maxValue: number,
    onUpdate: (updates: Partial<{ enabled: boolean; min: number; max: number }>) => void
  ) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <Switch
          checked={interval.enabled}
          onChange={(checked) => onUpdate({ enabled: checked })}
        />
        <span style={{ minWidth: '100px' }}>{label}</span>
        <Input
          type="number"
          value={interval.min}
          style={{ width: 80 }}
          onChange={(e) => onUpdate({ min: parseInt(e.target.value) })}
        />
      </div>
      <Slider
        range
        min={1}
        max={maxValue}
        value={[interval.min, interval.max]}
        onChange={(value: number[]) => {
          const [min, max] = value;
          onUpdate({ min, max });
        }}
        disabled={!interval.enabled}
      />
    </div>
  );

  return (
    <Modal
      title="RSI Settings"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="defaults" onClick={() => setSettings(initialSettings)}>
          Defaults
        </Button>,
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="ok" type="primary" onClick={handleSave}>
          Ok
        </Button>,
      ]}
      width={600}
    >
      <Tabs defaultActiveKey="inputs">
        <TabPane tab="Inputs" key="inputs">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Length</label>
              <Input
                type="number"
                value={settings.length}
                onChange={(e) =>
                  setSettings({ ...settings, length: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Smoothing Line</label>
              <Select
                style={{ width: '100%' }}
                value={settings.smoothingLine}
                onChange={(value) => setSettings({ ...settings, smoothingLine: value })}
              >
                <Select.Option value="SMA">SMA</Select.Option>
                <Select.Option value="EMA">EMA</Select.Option>
              </Select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>Smoothing Length</label>
              <Input
                type="number"
                value={settings.smoothingLength}
                onChange={(e) =>
                  setSettings({ ...settings, smoothingLength: parseInt(e.target.value) })
                }
              />
            </div>
          </div>
        </TabPane>
        <TabPane tab="Style" key="style">
          <div style={{ marginBottom: '24px' }}>
            {renderStyleItem(
              'Plot',
              settings.plot.visible,
              settings.plot.color,
              settings.plot.lineStyle,
              (updates) => setSettings({
                ...settings,
                plot: { ...settings.plot, ...updates }
              }),
              undefined
            )}
            {renderStyleItem(
              'Smoothed MA',
              settings.smoothedMA.visible,
              settings.smoothedMA.color,
              settings.smoothedMA.lineStyle,
              (updates) => setSettings({
                ...settings,
                smoothedMA: { ...settings.smoothedMA, ...updates }
              }),
              undefined
            )}
            {renderStyleItem(
              'Upper Limit',
              settings.upperLimit.visible,
              settings.upperLimit.color,
              settings.upperLimit.lineStyle,
              (updates) => setSettings({
                ...settings,
                upperLimit: { ...settings.upperLimit, ...updates }
              }),
              settings.upperLimit.value
            )}
            {renderStyleItem(
              'Middle Limit',
              settings.middleLimit.visible,
              settings.middleLimit.color,
              settings.middleLimit.lineStyle,
              (updates) => setSettings({
                ...settings,
                middleLimit: { ...settings.middleLimit, ...updates }
              }),
              settings.middleLimit.value
            )}
            {renderStyleItem(
              'Lower Limit',
              settings.lowerLimit.visible,
              settings.lowerLimit.color,
              settings.lowerLimit.lineStyle,
              (updates) => setSettings({
                ...settings,
                lowerLimit: { ...settings.lowerLimit, ...updates }
              }),
              settings.lowerLimit.value
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={settings.hlinesBackground}
                onChange={(checked) => setSettings({ ...settings, hlinesBackground: checked })}
              />
              <span>Hlines Background</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={settings.showLabels}
                onChange={(checked) => setSettings({ ...settings, showLabels: checked })}
              />
              <span>Labels on price scale</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={settings.showValues}
                onChange={(checked) => setSettings({ ...settings, showValues: checked })}
              />
              <span>Values in status line</span>
            </div>
          </div>
        </TabPane>
        <TabPane tab="Time" key="time">
          <div style={{ padding: '16px 0' }}>
            {renderTimeIntervalItem(
              'Minutes',
              settings.timeIntervals.minutes,
              59,
              (updates) => setSettings({
                ...settings,
                timeIntervals: {
                  ...settings.timeIntervals,
                  minutes: { ...settings.timeIntervals.minutes, ...updates }
                }
              })
            )}
            {renderTimeIntervalItem(
              'Hours',
              settings.timeIntervals.hours,
              24,
              (updates) => setSettings({
                ...settings,
                timeIntervals: {
                  ...settings.timeIntervals,
                  hours: { ...settings.timeIntervals.hours, ...updates }
                }
              })
            )}
            {renderTimeIntervalItem(
              'Days',
              settings.timeIntervals.days,
              366,
              (updates) => setSettings({
                ...settings,
                timeIntervals: {
                  ...settings.timeIntervals,
                  days: { ...settings.timeIntervals.days, ...updates }
                }
              })
            )}
            {renderTimeIntervalItem(
              'Weeks',
              settings.timeIntervals.weeks,
              52,
              (updates) => setSettings({
                ...settings,
                timeIntervals: {
                  ...settings.timeIntervals,
                  weeks: { ...settings.timeIntervals.weeks, ...updates }
                }
              })
            )}
            {renderTimeIntervalItem(
              'Months',
              settings.timeIntervals.months,
              12,
              (updates) => setSettings({
                ...settings,
                timeIntervals: {
                  ...settings.timeIntervals,
                  months: { ...settings.timeIntervals.months, ...updates }
                }
              })
            )}
          </div>
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default IndicatorSettingsModal; 