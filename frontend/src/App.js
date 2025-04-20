import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import StatusTable from './components/StatusTable';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { CloudArrowUpIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [urls, setUrls] = useState('');
  const [urlList, setUrlList] = useState([]);
  const [results, setResults] = useState([]);
  const [allUrls, setAllUrls] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch latest statuses on mount and after check
  useEffect(() => {
    fetch(`${API_URL}/latest_statuses`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setAllUrls((data.results || []).map(r => r.url));
      });
  }, []);

  // Dropzone for CSV
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        Papa.parse(file, {
          complete: (results) => {
            const urlArr = results.data.flat().filter(Boolean);
            setUrls(urlArr.join('\n'));
          },
        });
      }
    },
  });

  // Handle textarea input
  const handleInputChange = (e) => {
    setUrls(e.target.value);
  };

  // Parse URLs and submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlArr = urls
      .split(/\s|,|;/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    setUrlList(urlArr);
    setLoading(true);
    await fetch(`${API_URL}/check_urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: urlArr }),
    });
    // After checking, refresh the table with the latest statuses
    fetch(`${API_URL}/latest_statuses`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setAllUrls((data.results || []).map(r => r.url));
        setLoading(false);
      });
  };

  // Clear all URLs from backend and frontend
  const handleClear = async () => {
    await fetch(`${API_URL}/delete_all_urls`, { method: 'DELETE' });
    setResults([]);
    setUrlList([]);
    setUrls('');
    setAllUrls([]);
  };

  // Filtered results
  const filteredResults =
    filter === 'ALL'
      ? results
      : results.filter((r) => r.status === filter);

  return (
    <div className={clsx('min-h-screen transition-colors duration-300', darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900')}>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className={clsx('flex justify-between items-center mb-8')}>
          <h1 className="text-4xl font-bold tracking-tight">URL Inspector</h1>
          <button onClick={() => setDarkMode(!darkMode)} className={clsx(
            'rounded-full p-2 transition-colors',
            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300',
            'text-gray-800 dark:text-gray-100'
          )}>
            {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        </div>
        <div className={clsx('flex flex-col gap-8')}> 
          <div className="w-full">
            <div className={clsx('rounded-xl shadow-lg p-6 mb-6', darkMode ? 'bg-gray-800' : 'bg-white')}> 
              <form onSubmit={handleSubmit}>
                <label className="block mb-2 font-semibold text-lg">Enter URLs</label>
                <textarea
                  className={clsx(
                    'w-full border rounded-lg p-3 mb-3 font-mono focus:ring-2 focus:ring-blue-500 transition',
                    darkMode
                      ? 'border-gray-700 text-gray-100 bg-gray-700'
                      : 'border-gray-200 text-gray-900 bg-gray-100'
                  )}
                  rows={4}
                  value={urls}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
                <div {...getRootProps()} className={clsx(
                  'flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 border-dashed transition',
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : darkMode
                    ? 'border-gray-700 bg-gray-700'
                    : 'border-gray-200 bg-gray-100'
                )}>
                  <input {...getInputProps()} />
                  <CloudArrowUpIcon className="w-5 h-5 text-blue-500" />
                  <span>{isDragActive ? 'Drop the CSV here...' : 'Drag & drop CSV or click to upload'}</span>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? <span className="animate-spin mr-2 inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : null}
                  Check URLs
                </button>
              </form>
            </div>
            <div className={clsx('rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row md:items-center gap-4', darkMode ? 'bg-gray-800' : 'bg-white')}>
              <button
                className="px-4 py-2 rounded-full bg-gray-400 text-white hover:bg-gray-500 transition"
                onClick={handleClear}
                type="button"
              >
                Clear
              </button>
              <div className="flex gap-2 flex-1 justify-center md:justify-start">
                {['ALL','UP','DOWN'].map(type => (
                  <button
                    key={type}
                    className={clsx(
                      'px-4 py-2 rounded-full font-semibold transition',
                      filter === type
                        ? (type === 'UP' ? 'bg-green-500 text-white shadow' : type === 'DOWN' ? 'bg-red-500 text-white shadow' : 'bg-blue-500 text-white shadow')
                        : (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                    )}
                    onClick={() => setFilter(type)}
                  >{type}</button>
                ))}
              </div>
            </div>
            <StatusTable results={filteredResults} darkMode={darkMode} />
          </div>
          <AnalyticsDashboard urlList={allUrls} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

export default App;
