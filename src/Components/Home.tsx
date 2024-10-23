import React, { useEffect } from 'react';

import background from '../Resources/Backgrounds/Beach.jpg';

const TickerBar: React.FC = () => {
  useEffect(() => {
    // Check if the script already exists
    if (!document.getElementById('tradingview-widget-script')) {
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          {
            "proName": "BITSTAMP:BTCUSD",
            "title": "BTC/USD"
          },
          {
            "proName": "BITSTAMP:ETHUSD",
            "title": "ETH/USD"
          },
          {
            "proName": "BINANCE:SOLUSD",
            "title": "SOL/USD"
          },
          {
            "proName": "BINANCE:ADAUSD",
            "title": "ADA/USD"
          }
        ],
        "colorTheme": "dark",
        "isTransparent": false,
        "displayMode": "adaptive",
        "locale": "en"
      });
      document.getElementById('tradingview-widget')?.appendChild(script);
    }
  }, []);

  return (
    <div id="tradingview-widget" className="bg-gray-800 text-white h-16 flex items-center overflow-hidden">
      {/* The TradingView widget will be injected here */}
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="flex flex-col flex-grow h-full">
      <TickerBar />
      <div className="flex-grow bg-beach bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: `url(${background})` }}>
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-4">Welcome!</h1>
          <h2 className="text-2xl text-center mb-4">This is Michael Magahey's personal website.</h2>
          <textarea
            className="w-full h-48 bg-gray-700 text-white p-4 rounded-lg resize-none"
            readOnly
            value="You'll have to forgive the poor styling, but I grew up at the dawn of the internet and have always loved the young web designs. This website is mean't to be a personal hangout area of mine that I can share with other people. If you are a potential employer, this site is a reflection of myself, just keep that in mind. Enjoy and Explore!"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;