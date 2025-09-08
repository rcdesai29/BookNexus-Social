import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Avatar,
  Divider,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

interface ReviewReply {
  id: number;
  replyText: string;
  displayName: string;
  userId?: string;
  createdDate: string;
  ownReply: boolean;
  isAnonymous: boolean;
  replies: ReviewReply[];
  replyCount: number;
  likeCount: number;
  isLiked: boolean;
}

interface ReviewThreadProps {
  feedbackId?: number;
  googleFeedbackId?: number;
  reviewTitle: string;
  reviewAuthor: string;
  reviewText: string;
  reviewDate: string;
  reviewRating?: number;
  isOwnReview: boolean;
  isReviewAnonymous?: boolean;
}

const ReviewThread: React.FC<ReviewThreadProps> = ({
  feedbackId,
  googleFeedbackId,
  reviewTitle,
  reviewAuthor,
  reviewText,
  reviewDate,
  reviewRating,
  isOwnReview,
  isReviewAnonymous = false
}) => {
  const { isLoggedIn } = useAuth();
  const [replies, setReplies] = useState<ReviewReply[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteReplyId, setDeleteReplyId] = useState<number | null>(null);
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reviewLikeCount, setReviewLikeCount] = useState(0);
  const [isReviewLiked, setIsReviewLiked] = useState(false);
  const [likingReview, setLikingReview] = useState(false);

  // Auto-collapse if review text is too long or has too many replies
  useEffect(() => {
    if (reviewText.length > 500 || replies.length > 3) {
      setIsCollapsed(true);
    }
  }, [reviewText.length, replies.length]);

  // Fetch replies when component mounts or when expanded
  useEffect(() => {
    if (expanded) {
      fetchReplies();
    }
  }, [expanded, feedbackId, googleFeedbackId]);

  // Load like data when component mounts
  useEffect(() => {
    if (isLoggedIn && (feedbackId || googleFeedbackId)) {
      loadLikeData();
    }
  }, [isLoggedIn, feedbackId, googleFeedbackId]);

  const loadLikeData = async () => {
    try {
      // Use unified feedback ID - but we'll need to update like endpoints too
      const unifiedFeedbackId = feedbackId || googleFeedbackId;
      const endpoint = `/api/v1/likes/feedback/${unifiedFeedbackId}`;
      
      const response = await fetch(`http://localhost:8088${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviewLikeCount(data.likeCount);
        setIsReviewLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Failed to load like data:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      // Use unified feedback ID
      const unifiedFeedbackId = feedbackId || googleFeedbackId;
      const endpoint = `/api/v1/review-replies/feedback/${unifiedFeedbackId}`;
      
      const response = await fetch(`http://localhost:8088${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const repliesData = await response.json();
        
        // Fetch like data for each reply if user is logged in
        if (isLoggedIn) {
          const repliesWithLikes = await Promise.all(
            repliesData.map(async (reply: ReviewReply) => {
              try {
                const likeResponse = await fetch(`http://localhost:8088/api/v1/likes/reply/${reply.id}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  }
                });
                
                if (likeResponse.ok) {
                  const likeData = await likeResponse.json();
                  reply.likeCount = likeData.likeCount;
                  reply.isLiked = likeData.isLiked;
                }
                
                // Also fetch like data for nested replies
                if (reply.replies && reply.replies.length > 0) {
                  reply.replies = await Promise.all(
                    reply.replies.map(async (nestedReply) => {
                      try {
                        const nestedLikeResponse = await fetch(`http://localhost:8088/api/v1/likes/reply/${nestedReply.id}`, {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                          }
                        });
                        
                        if (nestedLikeResponse.ok) {
                          const nestedLikeData = await nestedLikeResponse.json();
                          nestedReply.likeCount = nestedLikeData.likeCount;
                          nestedReply.isLiked = nestedLikeData.isLiked;
                        }
                      } catch (error) {
                        // Ignore like data fetch errors for nested replies
                        nestedReply.likeCount = 0;
                        nestedReply.isLiked = false;
                      }
                      return nestedReply;
                    })
                  );
                }
                
                return reply;
              } catch (error) {
                // If like data fetch fails, set defaults
                reply.likeCount = 0;
                reply.isLiked = false;
                return reply;
              }
            })
          );
          setReplies(repliesWithLikes);
        } else {
          // If not logged in, set default like values
          setReplies(repliesData.map((reply: ReviewReply) => ({
            ...reply,
            likeCount: 0,
            isLiked: false,
            replies: reply.replies?.map(nestedReply => ({
              ...nestedReply,
              likeCount: 0,
              isLiked: false
            })) || []
          })));
        }
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      // Determine the correct feedback ID (unified system)
      const unifiedFeedbackId = feedbackId || googleFeedbackId;
      
      const requestData = {
        replyText: replyText.trim(),
        parentFeedbackId: unifiedFeedbackId,
        parentReplyId: replyToId,
        isAnonymous: false
      };

      console.log('Submitting reply with data:', requestData);
      console.log('feedbackId:', feedbackId, 'googleFeedbackId:', googleFeedbackId);

      const response = await fetch('http://localhost:8088/api/v1/review-replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        setReplyText('');
        setShowReplyBox(false);
        setReplyToId(null);
        await fetchReplies(); // Refresh replies
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 'Failed to submit reply';
        console.error('Failed to submit reply:', errorMessage);
        alert(errorMessage); // Show user-friendly error message
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReply = async (replyId: number) => {
    try {
      const response = await fetch(`http://localhost:8088/api/v1/review-replies/${replyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        await fetchReplies(); // Refresh replies
        setDialogOpen(false);
        setDeleteReplyId(null);
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const handleReplyToReply = (replyId: number) => {
    setReplyToId(replyId);
    setShowReplyBox(true);
  };

  const handleReviewLike = async () => {
    if (!isLoggedIn || likingReview) return;
    
    setLikingReview(true);
    try {
      const endpoint = feedbackId 
        ? `/api/v1/likes/feedback/${feedbackId}`
        : `/api/v1/likes/google-feedback/${googleFeedbackId}`;
      
      const response = await fetch(`http://localhost:8088${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviewLikeCount(data.likeCount);
        setIsReviewLiked(data.isLiked);
      }
    } catch (error) {
      console.error('Failed to like review:', error);
    } finally {
      setLikingReview(false);
    }
  };

  const handleReplyLike = async (replyId: number) => {
    if (!isLoggedIn) return;
    
    try {
      const response = await fetch(`http://localhost:8088/api/v1/likes/reply/${replyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update the reply in the replies state
        setReplies(prevReplies => 
          prevReplies.map(reply => 
            reply.id === replyId 
              ? { ...reply, likeCount: data.likeCount, isLiked: data.isLiked }
              : {
                  ...reply,
                  replies: reply.replies.map(nestedReply =>
                    nestedReply.id === replyId
                      ? { ...nestedReply, likeCount: data.likeCount, isLiked: data.isLiked }
                      : nestedReply
                  )
                }
          )
        );
      }
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  const renderReply = (reply: ReviewReply, isNested = false) => (
    <Card 
      key={reply.id} 
      sx={{ 
        ml: isNested ? 4 : 2, 
        mb: 1, 
        backgroundColor: isNested ? '#F9F9F9' : 'white',
        border: '1px solid #E6D7C3'
      }}
    >
      <CardContent sx={{ pb: '8px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#B8956A', fontSize: '0.75rem' }}>
            {reply.isAnonymous ? 'A' : reply.displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#3C2A1E' }}>
                {reply.displayName}
                {reply.isAnonymous && <Typography component="span" sx={{ color: '#8B7355', ml: 1 }}>(Anonymous)</Typography>}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {reply.createdDate}
                </Typography>
                {reply.ownReply && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setDeleteReplyId(reply.id);
                      setDialogOpen(true);
                    }}
                    sx={{ color: '#8B7355' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 1, color: '#3C2A1E' }}>
              {reply.replyText}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              {isLoggedIn && (
                <IconButton
                  size="small"
                  onClick={() => handleReplyLike(reply.id)}
                  sx={{ 
                    color: reply.isLiked ? '#FF5722' : '#8B7355',
                    p: 0.5,
                    '&:hover': {
                      backgroundColor: reply.isLiked ? 'rgba(255, 87, 34, 0.1)' : 'rgba(139, 115, 85, 0.1)'
                    }
                  }}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
              )}
              <Typography variant="caption" sx={{ color: '#8B7355', fontSize: '0.7rem' }}>
                {reply.likeCount || 0} {(reply.likeCount || 0) === 1 ? 'like' : 'likes'}
              </Typography>
              {isLoggedIn && !isNested && (
                <Button
                  size="small"
                  startIcon={<ReplyIcon />}
                  onClick={() => handleReplyToReply(reply.id)}
                  sx={{ 
                    color: '#2196F3', 
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    p: 0.5,
                    minWidth: 'auto',
                    ml: 1
                  }}
                >
                  Reply
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        {/* Nested replies */}
        {reply.replies && reply.replies.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {reply.replies.map(nestedReply => renderReply(nestedReply, true))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const totalReplies = replies.reduce((sum, reply) => sum + 1 + (reply.replies?.length || 0), 0);

  return (
    <Card sx={{ mb: 2, border: '1px solid #E6D7C3', borderRadius: 2 }}>
      <CardContent>
        {/* Original Review */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: '#B8956A' }}>
            {isReviewAnonymous ? 'A' : reviewAuthor.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#3C2A1E' }}>
                {reviewAuthor}
                {isReviewAnonymous && <Typography component="span" sx={{ color: '#8B7355', ml: 1 }}>(Anonymous)</Typography>}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {reviewDate}
              </Typography>
            </Box>
            {reviewRating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {[...Array(5)].map((_, i) => (
                  <Typography key={i} sx={{ color: i < reviewRating ? '#FFD700' : '#DDD', fontSize: '1.2rem' }}>
                    ★
                  </Typography>
                ))}
              </Box>
            )}
            <Collapse in={!isCollapsed} collapsedSize={80}>
              <Typography variant="body1" sx={{ color: '#3C2A1E' }}>
                {reviewText}
              </Typography>
            </Collapse>
            {(reviewText.length > 500 || totalReplies > 3) && (
              <Button
                size="small"
                onClick={() => setIsCollapsed(!isCollapsed)}
                sx={{ mt: 1, color: '#2196F3', textTransform: 'none' }}
              >
                {isCollapsed ? 'Show More' : 'Show Less'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Like Section */}
        {isLoggedIn && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
            <IconButton
              size="small"
              onClick={handleReviewLike}
              disabled={likingReview}
              sx={{ 
                color: isReviewLiked ? '#FF5722' : '#8B7355',
                '&:hover': {
                  backgroundColor: isReviewLiked ? 'rgba(255, 87, 34, 0.1)' : 'rgba(139, 115, 85, 0.1)'
                }
              }}
            >
              <ThumbUpIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ color: '#8B7355', ml: 0.5 }}>
              {reviewLikeCount} {reviewLikeCount === 1 ? 'like' : 'likes'}
            </Typography>
          </Box>
        )}

        {/* Expand/Collapse Replies Section */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
            sx={{ color: '#2196F3', textTransform: 'none' }}
          >
            {totalReplies > 0 ? `${totalReplies} ${totalReplies === 1 ? 'Reply' : 'Replies'}` : 'Replies'}
          </Button>
          {isLoggedIn && (
            <Button
              variant="text"
              onClick={() => {
                setReplyToId(null);
                setExpanded(true); // Auto-expand the thread
                setShowReplyBox(!showReplyBox);
              }}
              sx={{ 
                color: '#2196F3',
                textTransform: 'none',
                fontSize: '0.875rem'
              }}
            >
              Follow up?
            </Button>
          )}
        </Box>

        {/* Replies Section */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {replies.map(reply => renderReply(reply))}
            
            {/* Reply Input Box */}
            <Collapse in={showReplyBox}>
              <Card sx={{ mt: 2, backgroundColor: '#F9F9F9', border: '1px solid #E6D7C3' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#3C2A1E' }}>
                    {replyToId ? 'Reply to comment' : `Reply to ${reviewAuthor}'s review`}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={submitReply}
                      disabled={!replyText.trim() || submitting}
                      sx={{ 
                        bgcolor: '#2196F3',
                        '&:hover': { bgcolor: '#1976D2' }
                      }}
                    >
                      {submitting ? 'Posting...' : 'Post Reply'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowReplyBox(false);
                        setReplyText('');
                        setReplyToId(null);
                      }}
                      sx={{ color: '#8B7355', borderColor: '#E6D7C3' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Collapse>
          </Box>
        </Collapse>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Delete Reply</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this reply?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => deleteReplyId && deleteReply(deleteReplyId)}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ReviewThread;