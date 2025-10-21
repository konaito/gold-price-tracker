'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface ChartProps {
  data: { time: string; value: number }[];
  color: string;
  formatValue: string; // 'dollar' | 'yen' | 'percent'
  label: string;
  unit?: string;
}

export default function Chart({ data, color }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // データの妥当性チェック
    if (!data || data.length === 0) {
      console.warn('No data available for chart');
      return;
    }

    // チャートを作成
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: '#6b7280',
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: {
          color: '#e5e7eb',
        },
        horzLines: {
          color: '#e5e7eb',
        },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#e5e7eb',
      },
      timeScale: {
        borderColor: '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // エリアシリーズを追加
    const areaSeries = chart.addAreaSeries({
      topColor: color,
      bottomColor: color,
      lineColor: color,
      lineWidth: 3,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // データを設定
    const formattedData = data.map((item) => ({
      time: item.time,
      value: item.value,
    }));

    areaSeries.setData(formattedData);

    // 初期表示範囲を1ヶ月（30日）に設定
    if (formattedData.length > 0) {
      const lastTime = formattedData[formattedData.length - 1].time;
      const firstVisibleTime = formattedData[Math.max(0, formattedData.length - 30)].time;
      chart.timeScale().setVisibleRange({
        from: firstVisibleTime,
        to: lastTime,
      });
    }

    // リサイズハンドラー
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, color]);

  return (
    <div className="w-full">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
