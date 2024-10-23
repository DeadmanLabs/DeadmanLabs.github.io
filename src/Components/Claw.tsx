import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

import background from '../Resources/Backgrounds/Crickets.jpg';
const socket = io('http://localhost:3001');
const streamURL = 'http://localhost:3001/stream'


const Claw: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [queue, setQueue] = useState<{ users: string[], position: number }>({ users: [], position: 0 });
  const [coins, setCoins] = useState(0);
  const [controlsEnabled, setControlsEnabled] = useState(false);

  useEffect(() => {
    const connectSocket = () => {
      socket.connect();

      socket.on('connect', () => {
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setControlsEnabled(false);
      });

      socket.on('queue', (data: { users: string[], position: number }) => {
        setQueue(data);
      });

      socket.on('start', () => {
        setControlsEnabled(true);
      });

      socket.on('end', () => {
        setControlsEnabled(false);
      });
    };

    connectSocket();

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('queue');
      socket.off('start');
      socket.off('end');
    };
  }, []);

  const handleButtonPress = (action: string) => {
    if (controlsEnabled) {
      socket.emit('action', { action, state: 'start' });
    }
  };

  const handleButtonRelease = (action: string) => {
    if (controlsEnabled) {
      socket.emit('action', { action, state: 'stop' });
    }
  };

  const handleInsertCoin = () => {
    if (coins < 3) {
      setCoins(coins + 1);
      socket.emit('action', { action: 'insert', state: 'start' });
      socket.emit('action', { action: 'insert', state: 'stop' });
    }
  };

  const handleDropClaw = () => {
    socket.emit('action', { action: 'drop', state: 'start' });
    socket.emit('action', { action: 'drop', state: 'stop' });
  };

  return (
    <div className="relative flex flex-col items-center justify-center flex-grow h-full bg-gray-900 text-white p-8" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center w-full max-w-4xl h-auto max-h-[80vh]">
        <div className="w-full flex-grow bg-black rounded-lg mb-4 aspect-w-16 aspect-h-9">
          {/* Placeholder for RTSP livestream */}
          <video className="w-full h-full rounded-lg" controls>
            <source src={streamURL} type="application/x-rtsp" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="flex justify-between w-full mt-auto">
          <div className="flex flex-col items-center">
            <button
              className="bg-green-500 text-white p-2 mb-2 rounded-md hover:bg-green-700"
              onMouseDown={handleInsertCoin}
              disabled={coins >= 3 || !controlsEnabled}
            >
              Insert Coin
            </button>
            <button
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
              onMouseDown={handleDropClaw}
              disabled={!controlsEnabled}
            >
              Drop Claw
            </button>
          </div>
          <div className="flex flex-col items-center">
            <button
              className="bg-gray-700 text-white p-2 mb-2 rounded-md hover:bg-gray-600"
              onMouseDown={() => handleButtonPress('up')}
              onMouseUp={() => handleButtonRelease('up')}
              disabled={!controlsEnabled}
            >
              Up
            </button>
            <div className="flex">
              <button
                className="bg-gray-700 text-white p-2 mr-2 rounded-md hover:bg-gray-600"
                onMouseDown={() => handleButtonPress('left')}
                onMouseUp={() => handleButtonRelease('left')}
                disabled={!controlsEnabled}
              >
                Left
              </button>
              <button
                className="bg-gray-700 text-white p-2 rounded-md hover:bg-gray-600"
                onMouseDown={() => handleButtonPress('right')}
                onMouseUp={() => handleButtonRelease('right')}
                disabled={!controlsEnabled}
              >
                Right
              </button>
            </div>
            <button
              className="bg-gray-700 text-white p-2 mt-2 rounded-md hover:bg-gray-600"
              onMouseDown={() => handleButtonPress('down')}
              onMouseUp={() => handleButtonRelease('down')}
              disabled={!controlsEnabled}
            >
              Down
            </button>
          </div>
        </div>
        <div className="mt-4 text-center w-full">
          {queue.users.length > 0 ? (
            <p>You are in position {queue.position + 1} out of {queue.users.length}</p>
          ) : (
            <p>The queue is currently empty</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Claw;