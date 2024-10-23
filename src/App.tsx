import './App.css';

import React, { useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navigation from './Components/Navigation';
import Footer from './Components/Footer';
import Home from './Components/Home';
import Blog from './Components/Blog';
import Claw from './Components/Claw';
import Invest from './Components/Invest';
import Casino from './Components/Casino';
import Lake from './Components/Lake';
import Projects from './Components/Projects';
import Contact from './Components/Contact';
import About from './Components/About';
import AdminPanel from './Components/AdminPanel';
import NotFound from './Components/NotFound';

function App() {
  const [boring, setBoring] = useState(false);
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
  ], [network]);

  return (
    <div className="App h-screen flex flex-col">
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <BrowserRouter>
              <Navigation />
              <div className="flex flex-col flex-grow overflow-auto">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="claw" element={<Claw />} />
                  <Route path="invest" element={<Invest />} />
                  <Route path="casino" element={<Casino />} />
                  <Route path="lake" element={<Lake />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="about" element={<About />} />
                  <Route path="admin" element={<AdminPanel />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Footer />
            </BrowserRouter>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
}

export default App;
