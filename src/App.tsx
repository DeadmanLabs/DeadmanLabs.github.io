import './App.css';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navigation from './Components/Navigation.js';

function App() {
  const [page, setPage] = useState("Home");
  const [boring, setBoring] = useState(false);
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SlopeWalletAdapter(),
    new SolflareWalletAdapter({ network }),
  ], [network]);

  return (
    <div className="App">
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="Container">
              { boring ?
                <div>Boring</div>
                :
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Navigation className="mainNav" callback={setPage} page={page} />} >
                      <Route index element={<a>Home</a>} />
                      <Route path="blog" element={<a>Blog</a>} />
                      <Route path="claw" element={<a>Claw</a>} />
                      <Route path="invest" element={<a>Invest</a>} />
                      <Route path="casino" element={<a>Casino</a>} />
                      <Route path="lake" element={<a>Lake</a>} />
                      <Route path="contact" element={<a>Contact</a>} />
                      <Route path="about" element={<a>About</a>} />
                      <Route path="*" element={<a>Not Found</a>} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              }
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;
