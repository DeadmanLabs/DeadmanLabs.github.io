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
                    <img className="profile" src={"../../public/Resources/Integrations/Profile.jpg"} />
                    <div className="text">
                        Hello! My name is Michael Magahey, thanks for visiting my site. This is the fun version, if you would like to visit the boring
                        and professional portfolio page, just look for the boring switch at the bottom of this page. On the other hand, you can see some
                        of the projects above, and any that aren't listed can be found under the projects tab. I use solana wallets as a form of authentication
                        here, so there aren't any alternative ways of authentication at the moment. Keep in mind that this page is always under construction,
                        so some features might not be working 100% right now. Feel free to take a look around, as this is more of a passion project of mine.
                    </div>
                </div>
                <div className="right-side-display">

                </div>
            </div>
        </div>
    );
}

export default Home;