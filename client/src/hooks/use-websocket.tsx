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

// Global singleton WebSocket instance
let globalSocket: WebSocket | null = null;

export function useWebSocket(
  url: string,
  options: WebSocketOptions = {}
) {
  const {
    onOpen,
    onClose,
    onMessage,
    onError,
    reconnectInterval = 10000,
    reconnectAttempts = 5,
    shouldReconnect = true,
  } = options;

  const [readyState, setReadyState] = useState<ReadyState>(
    globalSocket?.readyState || ReadyState.CONNECTING
  );
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const handleOpen = useCallback((event: WebSocketEventMap['open']) => {
    console.log('WebSocket connected!');
    setReadyState(ReadyState.OPEN);
    onOpen?.(event);
  }, [onOpen]);

  const handleClose = useCallback((event: WebSocketEventMap['close']) => {
    setReadyState(ReadyState.CLOSED);
    onClose?.(event);
    
    // Clear global socket if it's the one being closed
    if (globalSocket === socketRef.current) {
      globalSocket = null;
    }

    if (shouldReconnect) {
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        setupWebSocket();
      }, reconnectInterval);
    }
  }, [onClose, shouldReconnect, reconnectInterval]);

  const handleMessage = useCallback((event: WebSocketEventMap['message']) => {
    setLastMessage(event);
    onMessage?.(event);
  }, [onMessage]);

  const handleError = useCallback((event: WebSocketEventMap['error']) => {
    console.error('WebSocket error:', event);
    onError?.(event);
  }, [onError]);

  const sendMessage = useCallback((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    const socket = socketRef.current || globalSocket;
    if (socket?.readyState === ReadyState.OPEN) {
      socket.send(data);
      return true;
    }
    return false;
  }, []);

  const setupWebSocket = useCallback(() => {
    // If there's already a global socket that's open, use it
    if (globalSocket && globalSocket.readyState === ReadyState.OPEN) {
      socketRef.current = globalSocket;
      setReadyState(ReadyState.OPEN);
      return;
    }

    // Clean up any existing connection
    if (socketRef.current) {
      try {
        socketRef.current.removeEventListener('open', handleOpen);
        socketRef.current.removeEventListener('close', handleClose);
        socketRef.current.removeEventListener('message', handleMessage);
        socketRef.current.removeEventListener('error', handleError);
        socketRef.current.close();
      } catch (error) {
        // Ignore errors
      }
    }

    // Create a new WebSocket connection
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = url.startsWith('ws:') || url.startsWith('wss:') 
        ? url 
        : `${protocol}//${window.location.host}${url}`;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      globalSocket = socket;
      
      setReadyState(socket.readyState);
      
      socket.addEventListener('open', handleOpen);
      socket.addEventListener('close', handleClose);
      socket.addEventListener('message', handleMessage);
      socket.addEventListener('error', handleError);
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }, [url, handleOpen, handleClose, handleMessage, handleError]);

  // Set up WebSocket connection
  useEffect(() => {
    setupWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [setupWebSocket]);

  return {
    sendMessage,
    lastMessage,
    readyState,
  };
}