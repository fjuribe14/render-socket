import React from 'react';
import io, { Socket } from 'socket.io-client';

interface SocketRoomListenerProps<T> {
  room: string;
  event: string;
  setData: React.Dispatch<React.SetStateAction<T>>;
  disable?: boolean;
}

// Singleton para mantener una única instancia del socket por URL
const socketInstances = new Map<string, Socket>();

function getSocketInstance(url: string): Socket {
  if (!socketInstances.has(url)) {
    const socket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    socketInstances.set(url, socket);
  }
  return socketInstances.get(url)!;
}

export function useSocketRoomListener<T>({
  room,
  event,
  setData,
  disable = false,
}: SocketRoomListenerProps<T>) {
  const isProd = process.env.NEXT_PUBLIC_NODE_ENV === 'production';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] ?? '';

  // Ref para mantener la instancia del socket sin causar re-renders
  const socketRef = React.useRef<Socket | null>(null);
  const isSubscribedRef = React.useRef(false);

  React.useEffect(() => {
    // Si está deshabilitado o no hay URL, no hacer nada
    if (disable || !apiUrl) return;

    // Obtener o crear la instancia singleton del socket
    const socket = getSocketInstance(apiUrl);
    socketRef.current = socket;

    // Handler para cuando el socket se conecta
    const handleConnect = () => {
      if (!isSubscribedRef.current) {
        socket.emit('subscribe', room);
        isSubscribedRef.current = true;
        if (!isProd) console.log(`📡 Subscribed to room: ${room}`);
      }
    };

    // Handler para eventos entrantes
    const handleIncomingEvent = (payload: { room: string; data: T }) => {
      setData(payload.data);
      if (!isProd) {
        console.log(`📦 Event '${event}' received for ${room}:`, payload);
      }
    };

    // Si el socket ya está conectado, suscribirse inmediatamente
    if (socket.connected) {
      handleConnect();
    }

    // Registrar listeners
    socket.on('connect', handleConnect);
    socket.on(event, handleIncomingEvent);

    // Cleanup: solo desuscribirse del room, NO desconectar el socket
    return () => {
      if (isSubscribedRef.current) {
        socket.emit('unsubscribe', room);
        isSubscribedRef.current = false;
        if (!isProd) console.log(`📡 Unsubscribed from room: ${room}`);
      }
      socket.off('connect', handleConnect);
      socket.off(event, handleIncomingEvent);
    };
  }, [room, event, setData, disable, apiUrl, isProd]);

  // Retornar el socket por si se necesita acceso directo
  return socketRef.current;
}

// Hook opcional para obtener el estado de conexión
export function useSocketConnection(disable = false) {
  const [isConnected, setIsConnected] = React.useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.split('/api')[0] ?? '';

  React.useEffect(() => {
    if (disable || !apiUrl) return;

    const socket = getSocketInstance(apiUrl);

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    setIsConnected(socket.connected);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [disable, apiUrl]);

  return isConnected;
}

// Función para limpiar todas las conexiones (útil para logout o unmount de la app)
export function disconnectAllSockets() {
  socketInstances.forEach((socket) => {
    socket.disconnect();
  });
  socketInstances.clear();
}
