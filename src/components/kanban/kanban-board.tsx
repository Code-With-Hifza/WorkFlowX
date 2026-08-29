'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn } from './kanban-column';
import { TaskCard, TaskItem } from './task-card';
import { PresenceIndicator } from '../collaboration/presence-indicator';

interface KanbanBoardProps {
  initialTasks: TaskItem[];
  orgSlug: string;
  onTaskClick?: (task: TaskItem) => void;
  onAddTask?: (status: string) => void;
}

const COLUMNS = [
  { id: 'todo', title: 'TODO' },
  { id: 'in_progress', title: 'IN PROGRESS' },
  { id: 'review', title: 'REVIEW' },
  { id: 'done', title: 'DONE' },
];

export function KanbanBoard({
  initialTasks,
  orgSlug,
  onTaskClick,
  onAddTask,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const taskToMove = tasks.find((t) => t.id === activeId);
    if (!taskToMove) return;

    // Determine target column status
    let targetStatus = taskToMove.status;
    if (['todo', 'in_progress', 'review', 'done'].includes(overId)) {
      targetStatus = overId as TaskItem['status'];
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) targetStatus = overTask.status;
    }

    if (taskToMove.status === targetStatus) return;

    // Optimistic UI Update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === activeId ? { ...t, status: targetStatus } : t
      )
    );

    // Server Persistence API Sync
    try {
      await fetch(`/api/tasks/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgSlug,
          status: targetStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to sync Kanban task status:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PresenceIndicator
          roomId={`org:${orgSlug}`}
          currentUser={{ userId: 'demo-user-id', fullName: 'Hifza Khan' }}
        />
        <span className="text-xs text-slate-400 font-medium">Real-Time Sync Active</span>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={colTasks}
                onTaskClick={onTaskClick}
                onAddTask={onAddTask}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
