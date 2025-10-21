'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import Chart from './Chart';

interface ChartClientProps {
  symbol: string;
  title: string;
  color: string;
  formatValue: string; // 'dollar' | 'yen' | 'percent'
  label: string;
  dataSource: string;
  backLink?: ReactNode;
  unit?: string;
}

interface PriceResponse {
  success: boolean;
  data: { time: string; value: number }[];
  currentValue: number;
  error?: string;
}

export default function ChartClient({
  symbol,
  title,
  color,
  formatValue: formatType,
  label,
  dataSource,
  backLink,
  unit = '',
}: ChartClientProps) {
  const [data, setData] = useState<{ time: string; value: number }[]>([]);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatValue = (value: number): string => {
    switch (formatType) {
      case 'dollar':
        return `$${value.toFixed(2)}${unit}`;
      case 'yen':
        return `¥${value.toFixed(2)}${unit}`;
      case 'percent':
        return `${value.toFixed(2)}%`;
      default:
        return value.toFixed(2);
    }
  };

  const fetchPrice = useCallback(async () => {
    try {
      const response = await fetch(`/api/price/${symbol}`);
      const result: PriceResponse = await response.json();
      
      if (result.success) {
        setData(result.data);
        setCurrentValue(result.currentValue);
        setError(null);
      } else {
        setData(result.data);
        setCurrentValue(result.currentValue);
        setError(result.error || 'サンプルデータを使用しています');
      }
      setIsLoading(false);
    } catch (err) {
      console.error(`Error fetching ${symbol}:`, err);
      setError('データの取得に失敗しました');
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    // 初期データをロード
    fetchPrice();

    // 10分ごとにデータを更新（キャッシュ期間を考慮）
    const interval = setInterval(() => {
      fetchPrice();
    }, 10 * 60 * 1000); // 10分ごと

    return () => clearInterval(interval);
  }, [symbol, fetchPrice]);

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
            {title}
          </h1>
          {backLink && (
            <div className="hidden sm:block">{backLink}</div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700">
            {isLoading ? '読み込み中...' : formatValue(currentValue)}
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6 flex items-center justify-center h-[400px] sm:h-[500px]">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 mx-auto mb-4`} 
                 style={{ borderColor: color }}></div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">データを読み込み中...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-2 sm:p-4 lg:p-6">
            <Chart 
              data={data} 
              color={color}
              formatValue={formatType}
              label={label}
              unit={unit}
            />
          </div>
        </div>
      )}

      <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
        {error && (
          <p className="text-yellow-600 mb-2">⚠️ {error}</p>
        )}
        <p>データソース: {dataSource}</p>
      </div>
    </div>
  );
}

