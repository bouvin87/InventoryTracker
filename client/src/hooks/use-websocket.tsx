import { useEffect, useState, useRef, useCallback } from 'react';

export enum ReadyState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

export interface WebSocketOptions {
  onOpen?: (event: WebSocketEventMap['open']) => void;
  onClose?: (event: WebSocketEventMap['close']) => void;
  onMessage?: (event: WebSocketEventMap['message']) => void;
  onError?: (event: WebSocketEventMap['error']) => void;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  shouldReconnect?: boolean;
}

export function useWebSocket(
  url: string,
  options: WebSocketOptions = {}
) {
  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnectInterval = 10000, // Öka till 10 sekunder för att minska antalet återanslutningar
    reconnectAttempts = 5, // Minska antalet försök
    shouldReconnect = true,
  } = options;

  const [readyState, setReadyState] = useState<ReadyState>(ReadyState.CONNECTING);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Starta om reconnect-räknaren när vi byter URL
  useEffect(() => {
    setReconnectCount(0);
  }, [url]);

  const handleOpen = useCallback((event: WebSocketEventMap['open']) => {
    setReadyState(ReadyState.OPEN);
    setReconnectCount(0);
    onOpen?.(event);
  }, [onOpen]);

  const handleClose = useCallback((event: WebSocketEventMap['close']) => {
    setReadyState(ReadyState.CLOSED);
    onClose?.(event);

    if (shouldReconnect && (reconnectAttempts === -1 || reconnectCount < reconnectAttempts)) {
      reconnectTimeoutRef.current = window.setTimeout(() => {
        setReconnectCount(prevCount => prevCount + 1);
      }, reconnectInterval);
    }
  }, [onClose, shouldReconnect, reconnectAttempts, reconnectCount, reconnectInterval]);

  const handleMessage = useCallback((event: WebSocketEventMap['message']) => {
    setLastMessage(event);
    onMessage?.(event);
  }, [onMessage]);

  const handleError = useCallback((event: WebSocketEventMap['error']) => {
    onError?.(event);
  }, [onError]);

  // Funktion för att skicka meddelanden
  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (socketRef.current?.readyState === ReadyState.OPEN) {
      socketRef.current.send(data);
      return true;
    }
    return false;
  }, []);

  // Anslut websocket
  useEffect(() => {
    // Förhindra onödiga anslutningar under utveckling
    if (import.meta.env.DEV) {
      console.log('Initierar WebSocket-anslutning');
    }
    
    // Skapa WebSocket med korrekt protokoll (ws/wss)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = url.startsWith('ws:') || url.startsWith('wss:') 
      ? url 
      : `${protocol}//${window.location.host}${url}`;
    
    // Återanvänd befintlig WebSocket om den fortfarande är öppen
    if (socketRef.current?.readyState === ReadyState.OPEN) {
      return;
    }
    
    // Rensa gamla anslutningar
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (err) {
        // Ignorera eventuella fel vid stängning
      }
    }
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    setReadyState(ReadyState.CONNECTING);

    // Lägg till event handlers
    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('error', handleError);

    return () => {
      // Rensa 
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Stäng socket vid unmounting
      if (socket) {
        socket.removeEventListener('open', handleOpen);
        socket.removeEventListener('close', handleClose);
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('error', handleError);

        // Stäng socket om den är öppen
        if (socket.readyState === ReadyState.OPEN) {
          socket.close();
        }
      }
    };
  }, [url, handleOpen, handleClose, handleMessage, handleError, reconnectCount]);

  return {
    sendMessage,
    lastMessage,
    readyState,
    reconnectCount,
  };
}