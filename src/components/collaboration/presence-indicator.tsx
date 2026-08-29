'use client';

import { useState, useEffect } from 'react';
import { Users, Eye } from 'lucide-react';

interface PresenceIndicatorProps {
  roomId: string;
  currentUser: {
    userId: string;
    fullName: string;
  };
}

export function PresenceIndicator({ roomId, currentUser }: PresenceIndicatorProps) {
  const [activeViewers, setActiveViewers] = useState<string[]>([currentUser.fullName]);

  useEffect(() => {
    // Simulated active viewers list for real-time presence display
    const mockViewers = [currentUser.fullName, 'Sara Connor', 'Ali Hassan'];
    setActiveViewers(mockViewers);
  }, [roomId, currentUser.fullName]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-inner">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <Eye className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-slate-300 font-medium">
        <span className="font-semibold text-white">{activeViewers[0]}</span>
        {activeViewers.length > 1 && (
          <span className="text-slate-400"> and {activeViewers.length - 1} others viewing live</span>
        )}
      </span>
    </div>
  );
}
