import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Outlet, Link } from 'react-router-dom';
import { TradingViewWidget } from './ExtraComponents';

import './Styles/Home.css';

const Home = (props) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;
        load();
        return () => { active = false }

        async function load() {
            setLoading(true);
            //...
            if (!active) { return; }
            //...
            setLoading(false);
        }
    }, [connection, publicKey]);

    return (
        <div className="home">
            
            <div className="side-display">
                <div className="left-side-display">

                </div>
                <div className="center-side-display">

                </div>
                <div className="right-side-display">

                </div>
            </div>
        </div>
    );
}

export default Home;