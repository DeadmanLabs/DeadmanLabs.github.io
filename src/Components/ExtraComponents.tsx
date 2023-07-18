import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const TradingViewWidget = (props: any) => {
    let symbols = {
        "symbols": [
            {
                "description": "BTCUSD",
                "proName": "BINANCE:BTCUSDT"
            },
            {
            "description": "ETHUSD",
            "proName": "BINANCE:ETHUSDT"
            },
            {
            "description": "SOLUSD",
            "proName": "BINANCE:SOLUSDT"
            },
            {
            "description": "MATICUSD",
            "proName": "BINANCE:MATICUSDT"
            },
            {
            "description": "FTMUSD",
            "proName": "BINANCE:FTMUSDT"
            },
            {
            "description": "LTCUSD",
            "proName": "BINANCE:LTCUSDT"
            },
            {
            "description": "XMRUSD",
            "proName": "BINANCE:XMRUSDT"
            },
            {
            "description": "ATOMUSD",
            "proName": "BINANCE:ATOMUSDT"
            },
        ],
        "showSymbolLogo": true,
        "colorTheme": "dark",
        "isTransparent": false,
        "displayMode": "adaptive",
        "locale": "en"
    }

    useEffect(() => {
        let script = document.createElement('script');
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.id = "widget";
        script.async = true;
        script.innerHTML = JSON.stringify(symbols);
        document.getElementById("widget-container")?.appendChild(script);
        return () => {
            if (document.getElementById("widget-container") != null) {
                document.getElementById("widget-container")?.removeChild(script);
            }
        }
    }, [symbols]);

    return (
        <div id="widget-container">
            <div className="tradingview-widget-container">
                <div className="tradingview-widget-container__widget"></div>
                <div className="tradingview-widget-copyright"></div>
            </div>
        </div>
    );
}

const WebRTCVideoPlayer = (props: any) => {
    const videoRef = useRef(null);
    useEffect(() => {
        const remoteDescription = new RTCSessionDescription({
            type: '',
            sdp: ''
        });
        const iceCandidate = new RTCIceCandidate({

        });

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: '' },
                { urls: '', username: '', credential: '' },
            ]
        });

        pc.ontrack = event => {
            if (videoRef.current && event.streams[0]) {
                videoRef.current.srcObject = event.streams[0];
            }
        };

        pc.setRemoteDescription(remoteDescription)
            .then(() => pc.addIceCandidate(iceCandidate))
            .catch(console.error);
    }, []);

    return <video ref={videoRef} autoPlay muted />
}

export { TradingViewWidget };