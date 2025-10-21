import ChartClient from './components/ChartClient';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <ChartClient
          symbol="jpygold"
          title="金価格チャート (JPY/g)"
          color="#ffd700"
          formatValue="yen"
          label="金価格"
          dataSource="Yahoo Finance (GC=F × USDJPY=X ÷ 31.1035)"
          unit="/g"
        />
      </main>
    </div>
  );
}
