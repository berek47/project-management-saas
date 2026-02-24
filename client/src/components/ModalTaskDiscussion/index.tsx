import Modal from "@/components/Modal";
import {
  Comment,
  Task,
  useCreateTaskCommentMutation,
  useGetAuthUserQuery,
} from "@/state/api";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareMore, Send } from "lucide-react";
import React from "react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  task: Task | null;
};

const ModalTaskDiscussion = ({ isOpen, onClose, projectId, task }: Props) => {
  const [commentValue, setCommentValue] = React.useState("");
  const [createTaskComment, { isLoading }] = useCreateTaskCommentMutation();
  const { data: authUser } = useGetAuthUserQuery();

  React.useEffect(() => {
    if (!isOpen) {
      setCommentValue("");
    }
  }, [isOpen]);

  if (!task) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextComment = commentValue.trim();

    if (!nextComment) {
      return;
    }

    setCommentValue("");

    try {
      await createTaskComment({
        taskId: task.id,
        text: nextComment,
        projectId,
      }).unwrap();
    } catch {
      setCommentValue(nextComment);
    }
  };

  const comments = task.comments || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name={`Task Discussion: ${task.title}`}
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-sand-100 bg-white/75 p-5 dark:border-stroke-dark dark:bg-dark-secondary/70">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
            Task Context
          </p>
          <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            {task.title}
          </h3>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            {task.description || "This task has no additional description yet."}
          </p>
        </div>

        <div className="rounded-3xl border border-sand-100 bg-white/75 p-5 dark:border-stroke-dark dark:bg-dark-secondary/70">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
                Discussion
              </p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {comments.length} message{comments.length === 1 ? "" : "s"}
              </h3>
            </div>
            <div className="rounded-full border border-sand-100 bg-sand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-slate-300">
              Task Chat
            </div>
          </div>

          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {comments.length ? (
              comments.map((comment: Comment) => {
                const isOwnComment =
                  comment.userId === authUser?.userDetails?.userId;

                return (
                  <div
                    key={comment.id}
                    className={`flex ${isOwnComment ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 ${
                        isOwnComment
                          ? "bg-blue-primary text-white"
                          : "border border-sand-100 bg-white text-slate-900 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-white"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-xs opacity-80">
                        <div className="h-7 w-7 overflow-hidden rounded-full bg-sand-50">
                          <Image
                            src={resolveImageUrl(comment.user?.profilePictureUrl, "/i1.jpg")}
                            alt={comment.user?.username || "User"}
                            width={28}
                            height={28}
                            className="h-7 w-7 object-cover"
                          />
                        </div>
                        <span className="font-semibold">
                          {comment.user?.username || "Workspace User"}
                        </span>
                        <span>comment #{comment.id}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-sand-100 px-5 py-8 text-center dark:border-stroke-dark">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-primary/10 text-blue-primary">
                  <MessageSquareMore className="h-5 w-5" />
                </div>
                <p className="mb-1 text-base font-semibold text-slate-900 dark:text-white">
                  Start the task discussion
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  Use this thread to discuss blockers, clarifications, and status updates for this task.
                </p>
              </div>
            )}
          </div>
        </div>

        <form
          className="rounded-3xl border border-sand-100 bg-white/75 p-5 dark:border-stroke-dark dark:bg-dark-secondary/70"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
            Add Reply
          </label>
          <div className="flex items-end gap-3">
            <textarea
              value={commentValue}
              onChange={(event) => setCommentValue(event.target.value)}
              placeholder="Write an update or ask a question about this task..."
              className="min-h-[110px] flex-1 rounded-3xl border border-sand-100 bg-white p-4 text-sm text-slate-900 outline-none transition focus:border-teal-500 dark:border-stroke-dark dark:bg-dark-tertiary dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading || !commentValue.trim()}
              className="inline-flex items-center rounded-full bg-blue-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="mr-2 h-4 w-4" />
              Reply
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ModalTaskDiscussion;
