import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { collaborationService, CollaborationEvent } from '../../services/collaboration.service';
import { useAuthStore } from '../../stores/authStore';
import { IssueStatus } from '../../types';
import { ArrowRight, MessageSquare, UserCheck, ExternalLink, Activity } from 'lucide-react';

export function GlobalToaster() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    const unsubscribe = collaborationService.subscribe((event: CollaborationEvent) => {
      // Don't show toast for actions initiated by self
      if (currentUser && event.actor.id === currentUser.id) {
        return;
      }

      playNotificationChime();

      if (event.type === 'status_change') {
        const getStatusColor = (s?: IssueStatus) => {
          switch (s) {
            case 'Resolved':
            case 'Closed':
              return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'In Progress':
              return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Waiting for Client':
              return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Open':
              return 'bg-rose-100 text-rose-800 border-rose-300';
            case 'Created':
            default:
              return 'bg-slate-100 text-slate-800 border-slate-300';
          }
        };

        const getRoleBadge = (role: string) => {
          switch (role) {
            case 'Owner':
              return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Admin':
              return 'bg-rose-100 text-rose-800 border-rose-200';
            default:
              return 'bg-blue-100 text-blue-800 border-blue-200';
          }
        };

        toast.custom(
          (t) => (
            <div
              id={`toast-collab-${event.id}`}
              className="flex w-full max-w-md items-start gap-3 rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md transition-all hover:shadow-2xl"
            >
              {/* Actor Avatar */}
              <div className="relative shrink-0">
                <img
                  src={event.actor.avatarUrl}
                  alt={event.actor.name}
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping opacity-75" />
                </span>
              </div>

              {/* Toast Body */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {event.actor.name}
                    </span>
                    <span
                      className={`text-[9px] font-semibold px-1 py-0.2 rounded border ${getRoleBadge(
                        event.actor.role
                      )}`}
                    >
                      {event.actor.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                </div>

                <p className="text-xs text-slate-700 mt-0.5">
                  Updated issue status for{' '}
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded">
                    {event.issue.id}
                  </span>
                </p>

                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  "{event.issue.title}"
                </p>

                {/* Status Badge Transition */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getStatusColor(
                      event.oldStatus
                    )}`}
                  >
                    {event.oldStatus}
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded border shadow-2xs ${getStatusColor(
                      event.newStatus
                    )}`}
                  >
                    {event.newStatus}
                  </span>
                </div>

                {/* Action CTA */}
                <div className="mt-2.5 flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      toast.dismiss(t);
                      navigate(`/projects/${event.issue.projectId}/issues/${event.issue.id}`);
                    }}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white transition-all hover:bg-blue-600 cursor-pointer shadow-2xs"
                  >
                    <span>View Issue</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ),
          {
            duration: 8000,
          }
        );
      } else if (event.type === 'comment_added') {
        toast(
          <div className="flex items-start gap-2.5 text-xs">
            <MessageSquare className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">
                {event.actor.name} commented on {event.issue.id}
              </p>
              <p className="text-slate-600 line-clamp-2 mt-0.5 italic">"{event.commentPreview}"</p>
              <button
                type="button"
                onClick={() => navigate(`/projects/${event.issue.projectId}/issues/${event.issue.id}`)}
                className="mt-1.5 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                Open discussion <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>,
          { duration: 6000 }
        );
      } else if (event.type === 'assignee_change') {
        toast(
          <div className="flex items-start gap-2.5 text-xs">
            <UserCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">
                {event.actor.name} reassigned {event.issue.id}
              </p>
              <p className="text-slate-600 mt-0.5">
                Assigned to {event.issue.assignee?.name || 'Unassigned'}
              </p>
            </div>
          </div>,
          { duration: 6000 }
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate, currentUser]);

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'border border-slate-200 bg-white text-slate-900 shadow-lg',
      }}
      closeButton
      richColors
    />
  );
}

// Gentle synthesized notification chime using Web Audio API
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Non-critical audio feedback
  }
}
