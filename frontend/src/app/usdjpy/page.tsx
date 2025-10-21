import ChartClient from '../components/ChartClient';

export default function UsdJpyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">
        <ChartClient
          symbol="usdjpy"
          title="ドル円チャート (USD/JPY)"
          color="#3b82f6"
          formatValue="yen"
          label="レート"
          dataSource="Yahoo Finance (USDJPY=X)"
        />
      </main>
    </div>
  );
}

