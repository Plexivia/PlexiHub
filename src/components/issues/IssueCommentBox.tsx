import React, { useState } from 'react';
import { User, IssueComment } from '../../types';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { formatDate, formatTime } from '../../lib/utils';
import { Send, MessageSquare } from 'lucide-react';

interface IssueCommentBoxProps {
  comments: IssueComment[];
  currentUser: User;
  onAddComment: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function IssueCommentBox({
  comments,
  currentUser,
  onAddComment,
  isLoading = false,
}: IssueCommentBoxProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(content.trim());
      setContent('');
      setIsFocused(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3">
        {comments && comments.length > 0 ? (
          comments.map((comm) => (
            <div
              key={comm.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar src={comm.author.avatarUrl} name={comm.author.name} size="xs" />
                  <span className="text-xs font-semibold text-slate-900">{comm.author.name}</span>
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {comm.author.role}
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400">
                  {formatDate(comm.createdAt)} at {formatTime(comm.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed pl-7 whitespace-pre-line">
                {comm.content}
              </p>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-500">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            <span>No comments yet. Start the discussion below.</span>
          </div>
        )}
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Avatar src={currentUser.avatarUrl} name={currentUser.name} size="xs" />
          <span className="text-xs font-semibold text-slate-900">{currentUser.name}</span>
          <Badge variant="default" className="px-1.5 py-0 text-[10px]">
            {currentUser.role}
          </Badge>
        </div>

        <Textarea
          placeholder="Add an operational note, reproduction details, or diagnostic update..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          rows={isFocused || content.length > 0 ? 3 : 2}
          className="resize-none text-xs"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Markdown formatting supported
          </span>
          <div className="flex items-center gap-2">
            {(isFocused || content) && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setContent('');
                  setIsFocused(false);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="xs"
              disabled={!content.trim() || submitting || isLoading}
              isLoading={submitting || isLoading}
              className="gap-1.5"
            >
              <Send className="h-3 w-3" />
              Post Comment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
