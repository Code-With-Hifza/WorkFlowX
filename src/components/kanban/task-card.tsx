'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, CheckSquare, GripVertical, AlertCircle } from 'lucide-react';

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string | null;
  subtasksProgress?: string;
  subtasksTotal?: number;
  subtasksCompleted?: number;
}

interface TaskCardProps {
  task: TaskItem;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    low: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all group shadow-sm ${
        isDragging ? 'opacity-40 scale-95 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div onClick={onClick} className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                priorityColors[task.priority]
              }`}
            >
              {task.priority}
            </span>
          </div>

          <h4 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-slate-600 hover:text-slate-300 transition-colors cursor-grab active:cursor-grabbing"
          title="Drag Task"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        {task.subtasksTotal ? (
          <div className="flex items-center gap-1.5 text-blue-400 font-medium">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{task.subtasksProgress}</span>
          </div>
        ) : (
          <span />
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
