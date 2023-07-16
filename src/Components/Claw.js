import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Outlet, Link } from 'react-router-dom';

import io from 'socket.io-client';

import './Styles/...';

const Claw = (props) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [queue, setQueue] = useState([]);
    const [status, setStatus] = useStatus("idle");

    useEffect(() => {
        let active = true;
        load();
        return () => { active = false }

        async function load() {
            setLoading(true);
            const newSocket = io(`https://172.105.3.191:4444`);
            newSocket.on('status', (details) => {
                setStatus(details.status);
            });
            newSocket.on('queue', (details) => {
                setQueue(details.queue);
            });
            setSocket(newSocket);
            if (!active) { return; }
            setLoading(false);
        }

        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [connection, publicKey, setSocket]);

    return (
        <>
            { socket ? (
                <div className="claw-game">
                    <div className="controller up" />
                    <div className="controller left" />
                    <div className="controller right" />
                    <div className="controller down" />
                    <div className="controller drop" />
                    <div className="controller coin" />
                </div>
            ): (
                <div>Not Connected</div>
            )}
        </>
    );
}

export default Claw;