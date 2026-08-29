'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard, TaskItem } from './task-card';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: string; // 'todo' | 'in_progress' | 'review' | 'done'
  title: string;
  tasks: TaskItem[];
  onTaskClick?: (task: TaskItem) => void;
  onAddTask?: (status: string) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const statusDotColor = {
    todo: 'bg-amber-400',
    in_progress: 'bg-blue-400',
    review: 'bg-purple-400',
    done: 'bg-emerald-400',
  }[id] || 'bg-slate-400';

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 min-h-[500px] transition-colors ${
        isOver ? 'bg-slate-900/60 border-blue-500/50' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor}`} />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {title}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold">
            {tasks.length}
          </span>
        </div>

        {onAddTask && (
          <button
            onClick={() => onAddTask(id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Add Task"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Column Items */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 flex-1">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}

          {tasks.length === 0 && (
            <div className="h-32 border border-dashed border-slate-800/80 rounded-xl flex items-center justify-center text-slate-600 text-xs font-medium">
              No tasks in {title.toLowerCase()}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
