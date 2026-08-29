import { Server as SocketIOServer } from 'socket.io';
import { redis } from './redis';

export interface PresenceUser {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  activeLocation: string; // e.g. 'Project: Website Redesign'
}

class RealtimeGateway {
  private io: SocketIOServer | null = null;
  private presenceMap = new Map<string, Set<string>>(); // room -> userIds

  public init(server: any) {
    if (this.io) return this.io;

    this.io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
      },
    });

    this.io.on('connection', (socket) => {
      // Join Room (Organization or Project Scope)
      socket.on('join_room', ({ roomId, user }: { roomId: string; user: PresenceUser }) => {
        socket.join(roomId);
        socket.data.user = user;
        socket.data.roomId = roomId;

        if (!this.presenceMap.has(roomId)) {
          this.presenceMap.set(roomId, new Set());
        }
        this.presenceMap.get(roomId)!.add(user.fullName);

        // Broadcast updated presence to room
        this.io?.to(roomId).emit('presence_update', {
          roomId,
          activeViewers: Array.from(this.presenceMap.get(roomId)!),
        });
      });

      // Handle Task Movement Broadcast
      socket.on('task_moved', (data: { taskId: string; newStatus: string; actorName: string; roomId: string }) => {
        socket.to(data.roomId).emit('task_moved_event', data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        const { roomId, user } = socket.data || {};
        if (roomId && user && this.presenceMap.has(roomId)) {
          this.presenceMap.get(roomId)!.delete(user.fullName);
          this.io?.to(roomId).emit('presence_update', {
            roomId,
            activeViewers: Array.from(this.presenceMap.get(roomId)!),
          });
        }
      });
    });

    return this.io;
  }

  public getIO() {
    return this.io;
  }
}

export const realtimeGateway = new RealtimeGateway();
