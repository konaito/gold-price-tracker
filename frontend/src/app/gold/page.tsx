import ChartClient from '../components/ChartClient';

export default function GoldPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <ChartClient
          symbol="gold"
          title="金価格チャート (XAU/USD)"
          color="#ffd700"
          formatValue="dollar"
          label="金価格"
          dataSource="Yahoo Finance (GC=F - 金先物)"
          unit="/oz"
        />
      </main>
    </div>
  );
}

