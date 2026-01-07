import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { PROVIDER_LIST } from '../constants/providers';
import type { Provider } from '../types';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const ProviderIcon = ({ provider }: { provider: Provider }) => {
  switch (provider) {
    case 'lastfm':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.4 17.2s-1.8 1-3.4 1c-2.4 0-3.6-1.4-3.6-3.8v-5.6h2.2v5.4c0 1.2.4 1.8 1.4 1.8 1 0 1.8-.4 1.8-.4l1.6 1.6zM7.4 8.6h2.2v8.4H7.4V8.6z"/>
        </svg>
      );
    case 'discogs':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6zm0-10c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z"/>
        </svg>
      );
    case 'musicbrainz':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5 16h-2v-6h-2v6H9v-6H7v6H5V8h2v1h2V8h2v1h2V8h2v8z"/>
        </svg>
      );
    case 'itunes':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"/>
          <path d="M10.854 8.675c.29-.408.875-.68 1.637-.68 1.488 0 2.213 1.137 2.213 2.658v3.167a3.076 3.076 0 0 0-2.42-1.166c-1.895 0-3.238 1.446-3.238 3.329 0 1.775 1.258 3.12 3.1 3.12 1.93.001 3.163-1.42 3.163-3.645V10.27c0-1.725-.97-3.412-3.12-3.412-1.284 0-2.125.6-2.125.6l.79 1.217z" fill="#fff"/>
        </svg>
      );
    default:
      return null;
  }
};

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [showTips, setShowTips] = useState(false);
  const { enabledProviders, toggleProvider } = useSettingsStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const providers = PROVIDER_LIST.filter(p => p.id !== 'mock');

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or use artist: / album: filters..."
            className="flex-1 p-4 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          <button
            type="submit"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Search
          </button>
        </div>
      </form>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mr-2">Providers:</span>
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => toggleProvider(p.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                enabledProviders[p.id]
                  ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600'
              }`}
            >
              <ProviderIcon provider={p.id} />
              <span className="text-xs font-bold">{p.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowTips(!showTips)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showTips ? 'Hide Tips' : 'Search Tips'}
          </button>
          
          <p className="hidden md:block text-[10px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-widest">
            artist:"Aphex Twin"
          </p>
        </div>
      </div>

      {showTips && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Advanced Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400"><code className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded">artist:name</code> Filter by specific artist</p>
              <p className="text-xs text-gray-500 dark:text-gray-400"><code className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded">album:title</code> Search for a specific album</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400"><code className="text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1 rounded">"exact phrase"</code> Use quotes for literal matches</p>
              <p className="text-xs text-gray-500 dark:text-gray-400"><code className="text-gray-400 italic">Example:</code> artist:Autechre album:Amber</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};