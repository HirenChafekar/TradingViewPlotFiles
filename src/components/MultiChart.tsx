import React, { useEffect, useRef } from "react";
import {
  createChart,
  LineStyle,
  Time,
  IChartApi,
  ISeriesApi,
  BarData,
  LineData,
  LineSeries,
  CandlestickSeries,
} from "lightweight-charts";

interface SeriesData {
  time: Time;
  value?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

interface IndicatorConfig {
  id: string;
  label: string;
  separateChart: boolean;
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

const MultiChart: React.FC<Props> = ({
  navData,
  lineData,
  indicatorsData,
  selectedIndicators,
  chartType,
}) => {
  const mainChartRef = useRef<HTMLDivElement>(null);
  const indicatorRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!mainChartRef.current) return;

    const commonOptions = {
      layout: { textColor: "#fff", background: { color: "#0e0e0e" } },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      timeScale: { timeVisible: true },
      crosshair: {
        mode: 0, // Normal crosshair mode
        vertLine: { width: 1, color: "#6A5ACD", style: LineStyle.Dashed },
        horzLine: { visible: true, color: "#6A5ACD", style: LineStyle.Dashed },
      },
    };

    // Create main chart
    const mainChart: IChartApi = createChart(mainChartRef.current, commonOptions);

    let mainSeries: ISeriesApi<"Line"> | ISeriesApi<"Candlestick">;

    if (chartType === "line") {
      mainSeries = mainChart.addSeries(LineSeries, { color: "#00bfff" });
      mainSeries.setData(lineData);
    } else {
      mainSeries = mainChart.addSeries(CandlestickSeries);
      mainSeries.setData(navData);
    }

    // Overlay indicators (like SMA, EMA) on main chart
    selectedIndicators.forEach((ind) => {
      if (indicatorsData[ind.id]) {
        const overlaySeries = mainChart.addSeries(LineSeries, {
          color: ind.id === "sma" ? "cyan" : "orange",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
        });
        const filteredData = (indicatorsData[ind.id] || []).filter(
          (d) => d.value !== null && d.value !== undefined
        );
        overlaySeries.setData(filteredData);
      }
    });

    // Separate indicator charts
    selectedIndicators
      .filter((ind) => ind.separateChart)
      .forEach((ind, idx) => {
        const el = indicatorRefs.current[idx];
        if (!el) return;

        const indicatorChart: IChartApi = createChart(el, commonOptions);

        const lineSeries = indicatorChart.addSeries(LineSeries, {
          color: "yellow",
          lineWidth: 2,
        });

        const filteredData = (indicatorsData[ind.id] || []).filter(
          (d) => d.value !== null && d.value !== undefined
        );
        lineSeries.setData(filteredData);

        // Sync charts' time range
        const sync = (range: any) => {
          if (range) {
            mainChart.timeScale().setVisibleLogicalRange(range);
            indicatorChart.timeScale().setVisibleLogicalRange(range);
          }
        };

        indicatorChart.timeScale().subscribeVisibleLogicalRangeChange(sync);
        mainChart.timeScale().subscribeVisibleLogicalRangeChange(sync);
      });

    return () => {
      mainChart.remove();
      indicatorRefs.current.forEach((ref) => {
        if (ref && ref.firstChild) {
          ref.removeChild(ref.firstChild);
        }
      });
    };
  }, [navData, lineData, indicatorsData, selectedIndicators, chartType]);

  return (
    <div style={{ height: `calc(100vh - 48px)`, display: 'flex', flexDirection: 'column', backgroundColor: '#0e0e0e' }}>
      <div
        ref={mainChartRef}
        style={{ flexGrow: 1, minHeight: 300 }}
      />
      {selectedIndicators
        .filter((ind) => ind.separateChart)
        .map((_, idx) => (
          <div
            key={idx}
            ref={(el) => (indicatorRefs.current[idx] = el)}
            style={{ height: 150 }}
          />
        ))}
    </div>
  );
};

export default MultiChart;
