'use client';

import { useState, useEffect } from 'react';
import { TaskItem } from '../kanban/task-card';
import {
  X,
  Clock,
  User,
  CheckSquare,
  MessageSquare,
  Send,
  Plus,
  Trash2,
} from 'lucide-react';

interface TaskDetailModalProps {
  task: TaskItem | null;
  orgSlug: string;
  onClose: () => void;
  onUpdate?: () => void;
}

export function TaskDetailModal({
  task,
  orgSlug,
  onClose,
  onUpdate,
}: TaskDetailModalProps) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    if (!task) return;

    const fetchComments = async () => {
      setIsLoadingComments(true);
      try {
        const res = await fetch(`/api/tasks/${task.id}/comments?org=${orgSlug}`);
        const data = await res.json();
        if (data.success) {
          setComments(data.data);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchComments();
  }, [task, orgSlug]);

  if (!task) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgSlug,
          content: commentText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCommentText('');
        setComments((prev) => [data.data, ...prev]);
        onUpdate?.();
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider">
              {task.status.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium capitalize">
              {task.priority} Priority
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          <div>
            <h2 className="text-xl font-bold text-white">{task.title}</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {task.description || 'No description provided for this task.'}
            </p>
          </div>

          {/* Progress & Subtasks */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-400" /> Subtask Progress
              </span>
              <span className="text-xs text-blue-400 font-semibold">
                {task.subtasksProgress || '0 / 0 completed'}
              </span>
            </div>
          </div>

          {/* Comments Timeline */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" /> Comments & Activity
            </h3>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment... (use @username to mention team members)"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-white outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {comments.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-white">
                      {c.author?.fullName || 'Team Member'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(c.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
