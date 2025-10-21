import { NextResponse } from 'next/server';

interface SymbolConfig {
  yahooSymbol: string;
  baseValue: number;
  volatility: number;
}

interface DataPoint {
  time: string;
  value: number;
}

const SYMBOL_CONFIGS: Record<string, SymbolConfig> = {
  'gold': {
    yahooSymbol: 'GC=F',
    baseValue: 2000,
    volatility: 50,
  },
  'jpygold': {
    yahooSymbol: 'GC=F',
    baseValue: 300000,
    volatility: 5000,
  },
  'usdjpy': {
    yahooSymbol: 'USDJPY=X',
    baseValue: 150,
    volatility: 2,
  },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const config = SYMBOL_CONFIGS[symbol];

  if (!config) {
    return NextResponse.json(
      { success: false, error: 'Invalid symbol' },
      { status: 400 }
    );
  }

  try {
    // Yahoo Finance APIを使用してデータを取得（6ヶ月分）
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${config.yahooSymbol}?interval=1d&range=180d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 300 }, // 5分間キャッシュ
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    
    // データを変換
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0].close;
    
    let formattedData = timestamps.map((timestamp: number, index: number) => {
      const date = new Date(timestamp * 1000);
      return {
        time: date.toISOString().split('T')[0],
        value: Math.round(prices[index] * 100) / 100,
      };
    }).filter((item: DataPoint) => {
      // null、NaN、Infinity、0以下の値を除外
      return item.value !== null && 
             !isNaN(item.value) && 
             isFinite(item.value) && 
             item.value > 0;
    });

    // jpygoldの場合は、金価格にドル円レートを掛けてグラムに変換
    if (symbol === 'jpygold') {
      const usdJpyResponse = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/USDJPY=X?interval=1d&range=180d',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
          next: { revalidate: 300 }, // 5分間キャッシュ
        }
      );

      if (usdJpyResponse.ok) {
        const usdJpyData = await usdJpyResponse.json();
        const usdJpyResult = usdJpyData.chart.result[0];
        const usdJpyPrices = usdJpyResult.indicators.quote[0].close;

        // 1オンス = 31.1035グラム
        const OUNCE_TO_GRAM = 31.1035;

        formattedData = formattedData
          .map((item: DataPoint, index: number) => {
            // 配列の範囲チェック
            if (index >= usdJpyPrices.length) return null;
            
            const usdJpyRate = usdJpyPrices[index];
            // USD/JPYレートの妥当性チェック
            if (!usdJpyRate || usdJpyRate <= 0 || !isFinite(usdJpyRate)) {
              return null;
            }

            const jpyPricePerOz = item.value * usdJpyRate;
            const jpyPricePerGram = jpyPricePerOz / OUNCE_TO_GRAM;
            
            // 計算結果の妥当性チェック
            if (!isFinite(jpyPricePerGram) || jpyPricePerGram <= 0) {
              return null;
            }

            return {
              ...item,
              value: Math.round(jpyPricePerGram * 100) / 100,
            };
          })
          .filter((item: DataPoint | null): item is DataPoint => item !== null); // nullを除外
      }
    }

    // データが空の場合はエラー
    if (formattedData.length === 0) {
      throw new Error('No valid data available');
    }

    return NextResponse.json(
      {
        success: true,
        data: formattedData,
        currentValue: formattedData[formattedData.length - 1].value,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    
    // エラーの場合はサンプルデータを返す
    const sampleData = generateSampleData(config);
    return NextResponse.json({
      success: false,
      data: sampleData,
      currentValue: sampleData[sampleData.length - 1].value,
      error: 'Failed to fetch real data, using sample data',
    });
  }
}

function generateSampleData(config: SymbolConfig) {
  const data = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  let baseValue = config.baseValue;

  for (let i = 180; i >= 0; i--) {
    const time = new Date(now - i * oneDay).toISOString().split('T')[0];
    const change = (Math.random() - 0.5) * config.volatility;
    baseValue += change;
    data.push({
      time,
      value: Math.round(baseValue * 100) / 100,
    });
  }

  return data;
}

