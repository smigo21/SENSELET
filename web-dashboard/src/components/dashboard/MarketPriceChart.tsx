
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceData {
  date: string;
  maize: number;
  wheat: number;
  teff: number;
  barley: number;
}

const MarketPriceChart: React.FC = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([
    { date: '2024-01-01', maize: 25, wheat: 30, teff: 45, barley: 20 },
    { date: '2024-01-08', maize: 28, wheat: 32, teff: 47, barley: 22 },
    { date: '2024-01-15', maize: 35, wheat: 31, teff: 46, barley: 21 },
    { date: '2024-01-22', maize: 38, wheat: 33, teff: 48, barley: 23 },
    { date: '2024-01-29', maize: 42, wheat: 35, teff: 50, barley: 25 },
    { date: '2024-02-05', maize: 40, wheat: 34, teff: 49, barley: 24 },
    { date: '2024-02-12', maize: 45, wheat: 36, teff: 52, barley: 26 },
  ]);

  const [selectedCrop, setSelectedCrop] = useState<string>('maize');

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(prevData => {
        const newData = [...prevData];
        const latest = newData[newData.length - 1];
        const newEntry = {
          date: new Date().toISOString().split('T')[0],
          maize: latest.maize + (Math.random() - 0.5) * 5,
          wheat: latest.wheat + (Math.random() - 0.5) * 4,
          teff: latest.teff + (Math.random() - 0.5) * 6,
          barley: latest.barley + (Math.random() - 0.5) * 3,
        };
        newData.push(newEntry);
        return newData.slice(-10); // Keep last 10 entries
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getCropColor = (crop: string) => {
    switch (crop) {
      case 'maize': return '#4CAF50';
      case 'wheat': return '#FF9800';
      case 'teff': return '#9C27B0';
      case 'barley': return '#2196F3';
      default: return '#666';
    }
  };

  const getPriceChange = (crop: keyof PriceData): string => {
    if (priceData.length < 2) return '0.0';
    const latest = priceData[priceData.length - 1][crop] as number;
    const previous = priceData[priceData.length - 2][crop] as number;
    return ((latest - previous) / previous * 100).toFixed(1);
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 5) return 'critical';
    if (change > 0) return 'warning';
    if (change < -5) return 'danger';
    return 'safe';
  };

  return (
    <div className="bg-card p-4 shadow-md rounded-md border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Market Price Trends</h2>
        <div className="flex gap-2">
          {['maize', 'wheat', 'teff', 'barley'].map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedCrop === crop
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {crop.charAt(0).toUpperCase() + crop.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['maize', 'wheat', 'teff', 'barley'].map(crop => {
            const change = parseFloat(getPriceChange(crop as keyof PriceData));
            return (
              <div key={crop} className="text-center">
                <div className="text-sm text-gray-600 capitalize">{crop}</div>
                <div className="text-lg font-bold">
                  ${(priceData[priceData.length - 1][crop as keyof PriceData] as number).toFixed(2)}
                </div>
                <div className={`text-xs ${change >= 0 ? 'text-critical' : 'text-safe'}`}>
                  {change >= 0 ? '+' : ''}{change}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedCrop}
              stroke={getCropColor(selectedCrop)}
              strokeWidth={2}
              dot={{ fill: getCropColor(selectedCrop), strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-semibold text-sm mb-2">Price Alerts</h3>
        <div className="text-xs text-gray-600">
          {parseFloat(getPriceChange(selectedCrop as keyof PriceData)) > 5 && (
            <div className="text-critical font-medium">
              ⚠️ {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} prices spiking - monitor closely
            </div>
          )}
          {parseFloat(getPriceChange(selectedCrop as keyof PriceData)) < -5 && (
            <div className="text-safe font-medium">
              📉 {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} prices dropping - potential buying opportunity
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPriceChart;
