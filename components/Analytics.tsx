
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import mockApi from '../services/api';
import type { HistoricalDataPoint } from '../types';

const Analytics: React.FC = () => {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === "class") {
          const newIsDarkMode = (mutation.target as HTMLElement).classList.contains('dark');
          setIsDarkMode(newIsDarkMode);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const historicalData = await mockApi.fetchHistoricalData();
      setData(historicalData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading analytical data...</div>;
  }

  const formattedData = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleString('en-US', { month: 'short', day: 'numeric' })
  }));

  const axisStrokeColor = isDarkMode ? '#a0aec0' : '#4a5568';
  const gridStrokeColor = isDarkMode ? '#4a5568' : '#e2e8f0';
  const tooltipContentStyle = {
    backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
    border: `1px solid ${gridStrokeColor}`
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Historical Analytics</h2>

      <div className="bg-light-secondary dark:bg-gray-medium p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Crowd Count Trend (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
            <XAxis dataKey="date" stroke={axisStrokeColor} />
            <YAxis stroke={axisStrokeColor} />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend />
            <Line type="monotone" dataKey="crowd_count" name="Avg. Crowd Count" stroke="#38b2ac" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-light-secondary dark:bg-gray-medium p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Alerts Overview (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
            <XAxis dataKey="date" stroke={axisStrokeColor} />
            <YAxis stroke={axisStrokeColor} />
            <Tooltip contentStyle={tooltipContentStyle} />
            <Legend />
            <Bar dataKey="alerts" name="Total Alerts" fill="#e53e3e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;