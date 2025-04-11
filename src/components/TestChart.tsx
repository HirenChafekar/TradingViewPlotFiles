import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  createChart,
  CrosshairMode,
  LineStyle,
  LineSeries,
  CandlestickSeries,
  Time,
  BarData,
  LineData,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import { getRandomColor, indicatorColorMap } from "../constant";
import IndicatorSettingsModal from './IndicatorSettingsModal';
import { IndicatorSettings, defaultSettings } from '../indicators';

interface IndicatorConfig {
  id: string;
  label: string;
  settings?: IndicatorSettings;
}

interface Props {
  navData: BarData[];
  lineData: LineData[];
  indicatorsData: {
    [key: string]: LineData[];
  };
  selectedIndicators: IndicatorConfig[];
  chartType: "line" | "candlestick";
}

const TestChart: React.FC<Props> = ({
  navData,
  lineData,
  indicatorsData,
  selectedIndicators,
  chartType,
}) => {
  // Initialize state first
  const [hoverValues, setHoverValues] = useState<{
    [key: string]: number | undefined;
  }>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [indicatorSettings, setIndicatorSettings] = useState<{[key: string]: IndicatorSettings}>(() =>
    selectedIndicators.reduce((acc, ind) => ({
      ...acc,
      [ind.id]: ind.settings || defaultSettings[ind.id]
    }), {})
  );

  // Then initialize refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const labelMap = useRef<Map<any, { label: string; color: string; id: string }>>(new Map());
  const hoverValuesRef = useRef<{[key: string]: number | undefined}>(hoverValues);
  const prevSettingsRef = useRef<{[key: string]: IndicatorSettings}>(indicatorSettings);

  const handleSettingsClick = useCallback((indicatorId: string) => {
    setSelectedIndicator(indicatorId);
    setIsSettingsOpen(true);
  }, []);

  const handleSettingsSave = useCallback((settings: IndicatorSettings) => {
    if (selectedIndicator) {
      setIndicatorSettings(prev => ({
        ...prev,
        [selectedIndicator]: settings
      }));
    }
    setIsSettingsOpen(false);
  }, [selectedIndicator]);

  const getIndicatorLabel = useCallback((ind: IndicatorConfig) => {
    const settings = indicatorSettings[ind.id];
    if (!settings) return ind.label;
    
    return `${ind.label} ${settings.length} ${settings.smoothingLine} ${settings.smoothingLength}`;
  }, [indicatorSettings]);

  const updateIndicatorSeries = useCallback((indicatorId: string, settings: IndicatorSettings) => {
    const chart = chartRef.current;
    if (!chart) return;

    const series = seriesRef.current.get(indicatorId);
    if (!series) return;

    // Update main series
    series.applyOptions({
      color: settings.plot.color,
      lineStyle: settings.plot.lineStyle === 'dashed' ? LineStyle.Dashed : LineStyle.Solid,
      visible: settings.plot.visible,
    });

    // Update or create limit lines for RSI
    if (indicatorId.toLowerCase() === 'rsi') {
      const data = indicatorsData[indicatorId];
      if (!data || data.length === 0) return;

      // Remove existing limit lines
      seriesRef.current.forEach((s, id) => {
        if (id.startsWith(`${indicatorId}-limit-`)) {
          chart.removeSeries(s);
          seriesRef.current.delete(id);
        }
      });

      // Add new limit lines with memoized data points
      const timePoints = useMemo(() => [
        { time: data[0].time, value: settings.upperLimit.value },
        { time: data[data.length - 1].time, value: settings.upperLimit.value }
      ], [data, settings.upperLimit.value]);

      if (settings.upperLimit.visible) {
        const upperLine = chart.addSeries(LineSeries, {
          color: settings.upperLimit.color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          priceScaleId: "left",
        });
        upperLine.setData(timePoints);
        seriesRef.current.set(`${indicatorId}-limit-upper`, upperLine);
      }

      if (settings.middleLimit.visible) {
        const middleLine = chart.addSeries(LineSeries, {
          color: settings.middleLimit.color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          priceScaleId: "left",
        });
        middleLine.setData([
          { time: data[0].time, value: settings.middleLimit.value },
          { time: data[data.length - 1].time, value: settings.middleLimit.value }
        ]);
        seriesRef.current.set(`${indicatorId}-limit-middle`, middleLine);
      }

      if (settings.lowerLimit.visible) {
        const lowerLine = chart.addSeries(LineSeries, {
          color: settings.lowerLimit.color,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          priceScaleId: "left",
        });
        lowerLine.setData([
          { time: data[0].time, value: settings.lowerLimit.value },
          { time: data[data.length - 1].time, value: settings.lowerLimit.value }
        ]);
        seriesRef.current.set(`${indicatorId}-limit-lower`, lowerLine);
      }
    }
  }, [indicatorsData]);

  // Memoize chart options
  const chartOptions = useMemo(() => ({
    layout: { background: { color: "#0e0e0e" }, textColor: "#ffffff" },
    grid: {
      vertLines: { visible: false },
      horzLines: { visible: false },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: "#6A5ACD",
        style: LineStyle.Dashed,
        width: 1,
      },
      horzLine: {
        color: "#6A5ACD",
        style: LineStyle.Dashed,
        visible: true,
      },
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: false,
    },
    rightPriceScale: {
      visible: true,
      borderColor: "#71649C",
    },
    leftPriceScale: {
      visible: true,
      borderColor: "#FF8C00",
      scaleMargins: {
        top: 0.15,
        bottom: 0.15,
      },
    },
  }), []);

  // Memoize overlay box styles
  const overlayBoxStyles = useMemo(() => ({
    position: "absolute" as const,
    top: 8,
    left: 8,
    backgroundColor: "#1e1e1e",
    padding: "8px 12px",
    borderRadius: 4,
    color: "#ffffff",
    fontSize: "12px",
    fontFamily: "monospace",
    zIndex: 10,
    opacity: 0.9,
    border: "1px solid #333",
  }), []);

  const renderOverlayBox = useCallback(() => {
    if (Object.keys(hoverValues).length === 0) return null;

    return (
      <div style={overlayBoxStyles}>
        {Array.from(labelMap.current.values()).map(({ label, color, id }) => {
          const val = hoverValues[label];
          const isIndicator = id !== "price";
          return (
            <div key={label} style={{ 
              color,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px'
            }}>
              <strong>{label}</strong>: {val?.toFixed(2) ?? "--"}
              {isIndicator && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSettingsClick(id)}
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [hoverValues, handleSettingsClick, overlayBoxStyles]);

  // Effect for creating/recreating the chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: { background: { color: "#0e0e0e" }, textColor: "#ffffff" },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#6A5ACD",
          style: LineStyle.Dashed,
          width: 1,
        },
        horzLine: {
          color: "#6A5ACD",
          style: LineStyle.Dashed,
          visible: true,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        visible: true,
        borderColor: "#71649C",
      },
      leftPriceScale: {
        visible: true,
        borderColor: "#FF8C00",
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
        },
      },
    });

    chartRef.current = chart;
    seriesRef.current.clear();

    const hasRSI = selectedIndicators.some(
      (ind) => ind.id.toLowerCase() === "rsi"
    );

    chart.applyOptions({
      leftPriceScale: {
        visible: hasRSI,
        scaleMargins: {
          top: 0.8,
          bottom: 0.1,
        },
        autoScale: true,
      },
      rightPriceScale: {
        visible: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    });

    labelMap.current.clear();

    if (chartType === "line") {
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#00bfff",
        priceScaleId: "right",
      });
      lineSeries.setData(lineData);
      labelMap.current.set(lineSeries, { label: "Price", color: "#00bfff", id: "price" });
    } else {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        priceScaleId: "right",
      });
      candleSeries.setData(navData);
      labelMap.current.set(candleSeries, { label: "Price", color: "#27A69A", id: "price" });
    }

    selectedIndicators.forEach((ind) => {
      const rawData = indicatorsData[ind.id];
      if (!rawData) return;

      const isRSI = ind.id.toLowerCase() === "rsi";
      const data = rawData.filter(
        (point) =>
          point && typeof point.value === "number" && !isNaN(point.value)
      );

      if (data.length === 0) return;
      const settings = indicatorSettings[ind.id];
      const color = settings?.plot?.color || indicatorColorMap[ind.id.toLowerCase()] || getRandomColor();

      const indicatorSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceScaleId: isRSI ? "left" : "right",
        lineStyle: settings?.plot?.lineStyle === 'dashed' ? LineStyle.Dashed : LineStyle.Solid,
        visible: settings?.plot?.visible !== false,
      });

      indicatorSeries.setData(data);
      seriesRef.current.set(ind.id, indicatorSeries);
      labelMap.current.set(indicatorSeries, {
        label: getIndicatorLabel(ind),
        color: color,
        id: ind.id
      });

      // Add horizontal lines for RSI if enabled
      if (isRSI && settings) {
        if (settings.upperLimit.visible) {
          const upperLine = chart.addSeries(LineSeries, {
            color: settings.upperLimit.color,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            priceScaleId: "left",
          });
          upperLine.setData([{ time: data[0].time, value: settings.upperLimit.value }, { time: data[data.length - 1].time, value: settings.upperLimit.value }]);
          seriesRef.current.set(`${ind.id}-limit-upper`, upperLine);
        }

        if (settings.middleLimit.visible) {
          const middleLine = chart.addSeries(LineSeries, {
            color: settings.middleLimit.color,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            priceScaleId: "left",
          });
          middleLine.setData([{ time: data[0].time, value: settings.middleLimit.value }, { time: data[data.length - 1].time, value: settings.middleLimit.value }]);
          seriesRef.current.set(`${ind.id}-limit-middle`, middleLine);
        }

        if (settings.lowerLimit.visible) {
          const lowerLine = chart.addSeries(LineSeries, {
            color: settings.lowerLimit.color,
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            priceScaleId: "left",
          });
          lowerLine.setData([{ time: data[0].time, value: settings.lowerLimit.value }, { time: data[data.length - 1].time, value: settings.lowerLimit.value }]);
          seriesRef.current.set(`${ind.id}-limit-lower`, lowerLine);
        }
      }
    });

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) return;

      const values: { [key: string]: number | undefined } = {};

      labelMap.current.forEach((item, series) => {
        const price = param.seriesData.get(series);
        if (price !== undefined) {
          values[item?.label] =
            typeof price === "object" && "close" in price
              ? (price as BarData).close
              : (price as any).value;
        }
      });

      // Only update if values have changed
      if (JSON.stringify(values) !== JSON.stringify(hoverValuesRef.current)) {
        hoverValuesRef.current = values;
        setHoverValues(values);
      }
    });

    prevSettingsRef.current = indicatorSettings;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current.clear();
    };
  }, [navData, lineData, indicatorsData, selectedIndicators, chartType]);

  // Effect for handling settings updates
  useEffect(() => {
    const prevSettings = prevSettingsRef.current;
    Object.entries(indicatorSettings).forEach(([indicatorId, settings]) => {
      const prevIndicatorSettings = prevSettings[indicatorId];
      if (JSON.stringify(prevIndicatorSettings) !== JSON.stringify(settings)) {
        updateIndicatorSeries(indicatorId, settings);
      }
    });
    prevSettingsRef.current = indicatorSettings;
  }, [indicatorSettings, indicatorsData]);

  return (
    <div style={{ height: `calc(100vh - 48px)`, backgroundColor: '#0e0e0e', position: 'relative' }}>
      {renderOverlayBox()}
      <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
      <IndicatorSettingsModal
        isOpen={isSettingsOpen}
        onClose={useCallback(() => setIsSettingsOpen(false), [])}
        onSave={handleSettingsSave}
        initialSettings={selectedIndicator ? indicatorSettings[selectedIndicator] : undefined}
      />
    </div>
  );
};

export default React.memo(TestChart);
