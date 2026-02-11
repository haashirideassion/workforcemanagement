import { useState } from 'react';
import { Trash, ChatCircle } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { ProjectTransition } from '@/types';
import { useAddTransitionComment, useDeleteTransitionComment } from '@/hooks/useProjectTransitions';

interface ProjectHistoryProps {
    transitions: ProjectTransition[];
    employeeId: string;
    employeeName: string;
}

export function ProjectHistory({ transitions }: ProjectHistoryProps) {
    const [selectedTransition, setSelectedTransition] = useState<ProjectTransition | null>(null);
    const [showCommentDialog, setShowCommentDialog] = useState(false);
    const [commentAuthor, setCommentAuthor] = useState('');
    const [commentText, setCommentText] = useState('');
    const addComment = useAddTransitionComment();
    const deleteComment = useDeleteTransitionComment();

    const handleAddComment = async () => {
        if (!commentText.trim() || !commentAuthor.trim() || !selectedTransition) {
            toast.error('Please fill in all comment fields');
            return;
        }

        addComment.mutate({
            transitionId: selectedTransition.id,
            commentBy: commentAuthor,
            commentText: commentText
        }, {
            onSuccess: () => {
                toast.success('Comment added successfully');
                setCommentAuthor('');
                setCommentText('');
                setShowCommentDialog(false);
                setSelectedTransition(null);
            }
        });
    };

    const handleDeleteComment = (commentId: string) => {
        if (confirm('Delete this comment?')) {
            deleteComment.mutate(commentId, {
                onSuccess: () => {
                    toast.success('Comment deleted');
                }
            });
        }
    };

    if (!transitions || transitions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        No project history available
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Project History Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {transitions.map((transition, index) => (
                            <div key={transition.id} className="relative">
                                {/* Timeline line */}
                                {index < transitions.length - 1 && (
                                    <div className="absolute left-3 top-10 w-0.5 h-[calc(100%-2rem)] bg-border" />
                                )}

                                {/* Timeline dot */}
                                <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-primary border-4 border-background flex items-center justify-center" />

                                {/* Content */}
                                <div className="ml-12 pb-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold text-base">
                                                {transition.project?.name || 'Unknown Project'}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {new Date(transition.start_date).toLocaleDateString()} 
                                                {transition.end_date ? ` - ${new Date(transition.end_date).toLocaleDateString()}` : ' - Present'}
                                            </p>
                                            {transition.duration_days && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Duration: {transition.duration_days} days
                                                </p>
                                            )}
                                        </div>
                                        <Badge variant={transition.status === 'active' ? 'default' : 'secondary'}>
                                            {transition.status}
                                        </Badge>
                                    </div>

                                    {/* Remarks */}
                                    {transition.remarks && (
                                        <div className="mt-3 p-3 bg-muted rounded-md">
                                            <p className="text-xs font-medium text-muted-foreground mb-1">Remarks:</p>
                                            <p className="text-sm">{transition.remarks}</p>
                                        </div>
                                    )}

                                    {/* Comments Section */}
                                    <div className="mt-4 space-y-3">
                                        {transition.comments && transition.comments.length > 0 && (
                                            <div className="space-y-2 pl-3 border-l-2 border-muted">
                                                {transition.comments.map((comment) => (
                                                    <div key={comment.id} className="text-sm">
                                                        <div className="flex items-start justify-between">
                                                            <p className="font-medium text-xs text-muted-foreground">
                                                                {comment.comment_by}
                                                            </p>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-5 w-5 text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                            >
                                                                <Trash size={12} />
                                                            </Button>
                                                        </div>
                                                        <p className="mt-1 text-muted-foreground">
                                                            {comment.comment_text}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(comment.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => {
                                                setSelectedTransition(transition);
                                                setShowCommentDialog(true);
                                            }}
                                        >
                                            <ChatCircle size={14} />
                                            Add Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Comment Dialog */}
            <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Comment</DialogTitle>
                        <DialogDescription>
                            Add feedback about {selectedTransition?.project?.name || 'this project'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Your Name / Title</label>
                            <Input
                                placeholder="e.g., Project Manager, Team Lead"
                                value={commentAuthor}
                                onChange={(e) => setCommentAuthor(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Comment</label>
                            <Textarea
                                placeholder="Share your feedback or observations..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="mt-1"
                                rows={4}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddComment} disabled={addComment.isPending}>
                            {addComment.isPending ? 'Adding...' : 'Add Comment'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
