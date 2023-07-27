import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo, useRef, MutableRefObject } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import io, { Socket } from 'socket.io-client';
import Axios from 'axios';

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

interface audioPropRequirements {
    url: string;
}

const AudioUploader = (props: audioPropRequirements) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files) as File[];
            setSelectedFiles(files);
        }
    };
    const uploadFiles = () => {
        selectedFiles.forEach((file) => {
            const formData = new FormData();
            formData.append('audio', file);
            Axios.post(props.url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            })
            .then((response) => {
                console.log('Audio upload successful!');
            })
            .catch((error) => {
                console.error('Error uploading audio:', error);
            });
        });
    }

    return (
        <div className="audio-uploader">
            <input type="file" multiple onChange={handleFileChange} />
            <button className="upload-button" onClick={uploadFiles}>Upload</button>
        </div>
    );
}

const AudioRecorder = (props: audioPropRequirements) => {
    const [isRecording, setIsRecording] = useState(false);
    const audioRef = useRef<MediaRecorder | null>(null);

    const handleRecordStart = () => {
        setIsRecording(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks: BlobPart[] = [];

                mediaRecorder.addEventListener('dataavailable', (event) => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener('stop', () => {
                    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                    uploadAudio(audioBlob);
                });

                mediaRecorder.start();
                audioRef.current = mediaRecorder;
            })
            .catch((error) => {
                console.error('Error accessing microphone:', error);
            });
    };

    const handleRecordEnd = () => {
        setIsRecording(false);
        if (audioRef.current) {
            audioRef.current.stop();
        }
    };

    const uploadAudio = (audioBlob: Blob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        Axios.post(props.url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then((repsonse) => {
            console.log('Audio upload successful!');
        })
        .catch((error) => {
            console.error('Error uploading audio:', error);
        });
    };

    return (
        <div className="audio-recorder">
            {isRecording ? <>
                <button className="record-button active" onMouseUp={handleRecordEnd}>
                    Release to stop recording
                </button>
            </> : <>
                <button className="record-button" onMouseDown={handleRecordStart}>
                    Press and hold to record
                </button>
            </>
            }
        </div>
    );
}

interface fileUploaderProps {
    url: string,
    acceptedFileTypes: string,
    allowMultiple: boolean
}

const FileUploader = (props: fileUploaderProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files) as File[];
            setSelectedFiles(files);
        }
    };
    const uploadFiles = () => {
        selectedFiles.forEach((file) => {
            const formData = new FormData();
            formData.append('file', file);
            Axios.post(props.url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            })
            .then((response) => {
                console.log('File upload successful!');
            })
            .catch((error) => {
                console.error('Error uploading file:', error);
            });
        });
    }

    return (
        <div className="file-uploader">
            <input type="file" multiple onChange={handleFileChange} />
            <button className="upload-button" onClick={uploadFiles}>Upload</button>
        </div>
    )
}

interface LiveImageViewerProps {
    url: string
}

const LiveImageViewer = (props: LiveImageViewerProps) => {
    const [image, setImage] = useState<string | null>(null);

    useEffect(() => {
        const socket = io(props.url);
        socket.on('image_update', data => {
            setImage(data);
        });

        return () => {
            socket.disconnect();
        };
    }, [props.url]);

    return (
        <div>
            {image && (
                <img src={image} alt="Image" />    
            )}
        </div>
    )
}

export { TradingViewWidget, AudioUploader, AudioRecorder, FileUploader, LiveImageViewer }