import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Outlet, Link } from 'react-router-dom';

import './Styles/Navigation.css';
require('@solana/wallet-adapter-react-ui/styles.css');

const Navigation = (props) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const pages = { 
        "Home": '', 
        "Blog": 'blog', 
        "Claw": 'claw', 
        "Invest": 'invest', 
        "Gamble": 'casino', 
        "Lake": 'lake', 
        "Contact": 'contact', 
        "About": 'about'
    };
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState("");

    let getBalance = async function() {
        try {
            return ((await connection.getBalance(publicKey)).valueOf() / LAMPORTS_PER_SOL).toFixed(8);
        } catch (e) {
            console.error(`[ERR] - Failed to grab balance!`);
        }
        return (0.0).toFixed(8);
    }

    useEffect(() => {
        let active = true;
        load();
        return () => { active = false }

        async function load() {
            setLoading(true);
            const res = (await getBalance()).toString();
            if (!active) { return; }
            setTokens(res);
            setLoading(false);
        }
    }, [connection, publicKey]);

    return (
        <>
            <div className="nav">
                <div className="navLeft">
                    {
                        Object.entries(pages).map(([name, route]) => {
                            return (
                                <Link className={props.page===route?`active`:`inactive`} onClick={()=>props.callback(route)} to={pages[name]}>
                                    <span className={`icon ${name}`}></span>
                                    <b className="route">{name}</b>
                                </Link>
                            );
                        })
                    }
                </div>
                <div className="navCenter">
                    { loading ? "Loading..." : tokens + " SOL"}
                </div>
                <div className="navRight">
                    <a className="web3">
                        <WalletMultiButton />
                        <WalletDisconnectButton />
                    </a>
                </div>
            </div>
            <Outlet />
        </>
    )
}

export default Navigation;