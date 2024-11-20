import React, { useState } from 'react';
import './URLShortener.css';

function URLShortener() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const API_KEY = '579fb4c88c471a8f2539aa97e4a1f3de53046';
  const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleShorten = async () => {
    if (!longUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(longUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setCopied(false);

    try {
      const apiUrl = `https://cutt.ly/api/api.php?key=${API_KEY}&short=${encodeURIComponent(longUrl)}`;
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (data.url && data.url.status === 7) {
        setShortUrl(data.url.shortLink);
      } else {
        throw new Error('Failed to shorten URL');
      }
    } catch (err) {
      // If the API fails, let's use TinyURL's simple API as a backup
      try {
        const tinyUrlResponse = await fetch(`${CORS_PROXY}${encodeURIComponent(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`)}`, {
          method: 'GET'
        });
        
        if (!tinyUrlResponse.ok) throw new Error('Backup API failed');
        
        const shortUrl = await tinyUrlResponse.text();
        setShortUrl(shortUrl);
      } catch (backupErr) {
        // If both APIs fail, fall back to demo mode
        const hash = Math.random().toString(36).substring(2, 8);
        setShortUrl(`https://short.url/${hash}`);
        setError('Using demo mode. For production, we would use a real URL shortening service.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy URL');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleShorten();
    }
  };

  return (
    <div className="shortener-container">
      <div className="content-wrapper">
        <div className="header">
          <h1>URL Shortener</h1>
          <p className="subtitle">Simplify your links with our powerful URL shortener</p>
        </div>

        <div className="input-section">
          <div className="url-input-wrapper">
            <input
              type="url"
              value={longUrl}
              onChange={(e) => {
                setLongUrl(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter your long URL here"
              className={error ? 'error' : ''}
              disabled={isLoading}
            />
            <button 
              onClick={handleShorten}
              disabled={isLoading}
              className="shorten-button"
            >
              {isLoading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        {shortUrl && (
          <div className="result-section">
            <h3>Your shortened URL is ready!</h3>
            <div className="shortened-url-wrapper">
              <input 
                type="text" 
                value={shortUrl} 
                readOnly 
                className="shortened-url"
              />
              <button 
                onClick={handleCopy}
                className={`copy-button ${copied ? 'copied' : ''}`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default URLShortener;
