const notificationTypeMessages = {
  post_liked: 'liked your post',
  post_commented: 'commented on your post',
  follow_request_accepted: 'accepted your follow request',
};

const toPostPreview = (content = '') => {
  const normalized = String(content || '').trim().replace(/\s+/g, ' ');
  if (!normalized) return '';
  return normalized.length > 80 ? `${normalized.slice(0, 77)}...` : normalized;
};

const buildPostInteractionNotification = ({ type, actor, post }) => {
  const suffix = notificationTypeMessages[type] || 'interacted with your post';
  const actorName = actor?.username || 'Someone';
  const postPreview = toPostPreview(post?.content);

  return {
    type,
    message: `${actorName} ${suffix}`,
    actor: {
      id: actor?.id || null,
      username: actor?.username || 'Unknown',
      avatarUrl: actor?.avatarUrl || null,
    },
    post: {
      id: post?.id || null,
      preview: postPreview,
      likeCount: typeof post?._count?.likes === 'number' ? post._count.likes : null,
      commentCount: typeof post?._count?.comments === 'number' ? post._count.comments : null,
    },
    link: post?.id ? `/post/${post.id}` : null,
    createdAt: new Date().toISOString(),
  };
};

const buildFollowRequestAcceptedNotification = ({ actor }) => {
  const actorName = actor?.username || 'Someone';

  return {
    type: 'follow_request_accepted',
    message: `${actorName} accepted your follow request`,
    actor: {
      id: actor?.id || null,
      username: actor?.username || 'Unknown',
      avatarUrl: actor?.avatarUrl || null,
    },
    link: actor?.id ? `/profile/${actor.id}` : null,
    createdAt: new Date().toISOString(),
  };
};

const getUserRoom = (userId) => `user:${userId}`;

const emitNotificationToUser = (io, userId, payload) => {
  if (!io || !userId || !payload) return false;

  const room = getUserRoom(userId);
  const subscribers = io.sockets?.adapter?.rooms?.get?.(room);
  if (!subscribers || subscribers.size === 0) {
    return false;
  }

  io.to(room).emit('notification', payload);
  return true;
};

export {
  buildFollowRequestAcceptedNotification,
  buildPostInteractionNotification,
  emitNotificationToUser,
  getUserRoom,
};
