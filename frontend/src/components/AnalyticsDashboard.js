import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import clsx from 'clsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
// FIX: Chart.js registration for react-chartjs-2 v5+
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function AnalyticsDashboard({ urlList, darkMode }) {
  const [analytics, setAnalytics] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (urlList.length > 0) {
      setSelectedUrl(urlList[0]);
    }
  }, [urlList]);

  useEffect(() => {
    if (selectedUrl) {
      fetch(`${API_URL}/url_history?url=${encodeURIComponent(selectedUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          setHistory(data.history || []);
        });
    }
  }, [selectedUrl]);

  useEffect(() => {
    if (urlList.length > 0) {
      fetch(`${API_URL}/analytics?urls=${urlList.map(encodeURIComponent).join(',')}`)
        .then((res) => res.json())
        .then((data) => setAnalytics(data.analytics || []));
    }
  }, [urlList]);

  // Prepare data for charts
  const uptime = analytics.find((a) => a.url === selectedUrl)?.uptime_percent ?? null;
  const responseTimes = history.map((h) => h.response_time);
  // Treat checked_at as UTC and convert to local time for display
  const timestamps = history.map((h) => dayjs.utc(h.checked_at).local().format('MMM D, h:mm:ss A'));

  return (
    <div className={clsx('rounded-xl shadow-lg p-6', darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900', 'h-full flex flex-col')}> 
      <h2 className="text-xl font-bold mb-4">Analytics</h2>
      {urlList.length === 0 ? (
        <div className="text-gray-400">No URLs to show analytics for.</div>
      ) : (
        <>
          <div className="mb-4">
            <label className="font-semibold mr-2">Select URL:</label>
            <select
              className={clsx('border rounded p-2 bg-transparent', darkMode ? 'border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900')}
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
            >
              {urlList.map((url, idx) => (
                <option key={idx} value={url}>{url}</option>
              ))}
            </select>
          </div>
          <div className="mb-4 flex items-center gap-2">
            <span className="font-semibold">Uptime % (last 30 days): </span>
            {uptime !== null ? (
              <span className="text-blue-600 font-bold">{uptime.toFixed(2)}%</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <h3 className="font-semibold mb-2">Response Time Trend</h3>
            {responseTimes.length > 0 ? (
              <Line
                data={{
                  labels: timestamps,
                  datasets: [
                    {
                      label: 'Response Time (ms)',
                      data: responseTimes,
                      fill: false,
                      borderColor: darkMode ? '#60a5fa' : '#2563eb',
                      backgroundColor: darkMode ? '#60a5fa' : '#2563eb',
                      tension: 0.3,
                      pointRadius: 4,
                      pointHoverRadius: 7,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => ` ${ctx.parsed.y} ms at ${ctx.label}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: { display: true, text: 'Timestamp' },
                      ticks: { color: darkMode ? '#d1d5db' : '#374151', font: { family: 'Inter' } },
                    },
                    y: {
                      title: { display: true, text: 'ms' }, beginAtZero: true,
                      grid: { color: darkMode ? '#374151' : '#e5e7eb' },
                      ticks: { color: darkMode ? '#d1d5db' : '#374151', font: { family: 'Inter' } },
                    },
                  },
                  animation: {
                    duration: 700,
                    easing: 'easeOutQuart',
                  },
                }}
              />
            ) : (
              <div className="text-gray-400">No data</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
