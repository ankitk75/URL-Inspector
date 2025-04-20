import React from 'react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(utc);
dayjs.extend(relativeTime);

function StatusTable({ results, darkMode }) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full rounded-xl shadow', darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900')}>
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">URL</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Response Time</th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Last Checked</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-6 text-gray-400">No results</td>
            </tr>
          ) : (
            results.map((r, idx) => (
              <tr
                key={idx}
                className={clsx('transition hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer')}
              >
                <td className="px-6 py-4 break-all font-mono text-sm">{r.url}</td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    'inline-block px-3 py-1 rounded-full text-xs font-bold',
                    r.status === 'UP'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  )}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {typeof r.response_time === 'number' ? `${Math.round(r.response_time)} ms` : '-'}
                </td>
                <td className="px-6 py-4">
                  {r.last_checked
                    ? <span title={dayjs.utc(r.last_checked).local().format('MMM D, YYYY h:mm:ss A')}>{dayjs.utc(r.last_checked).local().fromNow()}</span>
                    : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StatusTable;
