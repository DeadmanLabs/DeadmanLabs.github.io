import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo, useRef, MutableRefObject } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import io, { Socket } from 'socket.io-client';

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

const WebRTCBroadcast = (props: any) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerConnections = useRef({});

    useEffect(() => {
        socketRef.current = io(window.location.origin);
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current!.srcObject = stream;
                socketRef.current!.emit('broadcaster');
            })
            .catch(error => console.error(error));

        socketRef.current.on('watcher', id => {
            const peerConnection = new RTCPeerConnection();
            let stream = videoRef.current!.srcObject;
            stream!.getTracks().forEach(track => peerConnection.addTrack(track, stream));
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socketRef.current!.emit('candidate', id, event.candidate);
                }
            };
            peerConnection.createOffer()
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    socketRef.current!.emit('offer', id, peerConnection.localDescription);
                });
        });

        socketRef.current.on('answer', (id, description) => {
            peerConnections[id].setRemoteDescription(description);
        });

        socketRef.current.on('candidate', (id, candidate) => {
            peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
        });

        socketRef.current.on('disconnectPeer', id => {
            peerConnections[id].close();
            delete peerConnections[id];
        });

        window.onunload = window.onbeforeunload = () => {
            socketRef.current!.close();
        };
    }, []);

    return (
        <video ref={videoRef} autoPlay muted playsInline />
    );
}

const WebRTCWatch = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io(window.location.origin);

        socketRef.current.on('offer', (id, description) => {
            const peerConnection = new RTCPeerConnection();
            peerConnection.setRemoteDescription(description)
                .then(() => peerConnection.createAnswer())
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    socketRef.current!.emit('answer', id, peerConnection.localDescription);
                });

            peerConnection.ontrack = event => {
                videoRef.current!.srcObject = event.streams[0];
            };

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socketRef.current!.emit('candidate', id, event.candidate);
                }
            };
        });

        socketRef.current.on('candidate', (id, candidate) => {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.error(e));
        });

        socketRef.current.on('connect', () => {
            socketRef.current!.emit('watcher');
        });
        socketRef.current.on('broadcaster', () => {
            socketRef.current!.emit('watcher');
        });
        window.onunload = window.onbeforeunload = () => {
            socketRef.current!.close();
            peerConnection.close();
        };
    }, []);

    return (
        <video ref={videoRef} autoPlay playsInline />
    );
}

export { TradingViewWidget }