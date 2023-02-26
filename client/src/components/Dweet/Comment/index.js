import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useUser } from 'context/UserContext';
import { useCreateDweet, useDweets } from 'utils/dweets';
import DisplayError from 'components/DisplayError';
import DweetsBoard from 'components/DweetsBoard';
import { CommentContainer, CommentForm, CommentInput } from './style';
import { UserAvatar } from 'shared/components';
import portraitPlaceholder from 'img/portrait-placeholder.png';

function validateComment(comment) {
  if (comment.text.length < 1 || comment.text.length > 280) {
    return false;
  }
  return true;
}

function Comment({ dweetId }) {
  const {
    status,
    error,
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDweets({ replyTo: dweetId });
  const user = useUser();
  const createDweetMutation = useCreateDweet();
  const [comment, setComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();

    if (validateComment({ text: comment })) {
      createDweetMutation.mutate(
        { text: comment, replyTo: dweetId },
        {
          onSuccess: () => {
            setComment('');
          },
        }
      );
    }
  };

  if (error) {
    return <DisplayError error={error} />;
  }

  return (
    <>
      {createDweetMutation.isError && (
        <DisplayError error={createDweetMutation.error} />
      )}
      <CommentContainer>
        <UserAvatar
          tiny
          src={user?.avatar || portraitPlaceholder}
          alt="User Avatar"
        />
        <CommentForm onSubmit={handleAddComment}>
          <CommentInput
            placeholder="Dweet your reply"
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </CommentForm>
      </CommentContainer>
      <DweetsBoard
        queryKey={['dweets', { replyTo: dweetId }]}
        loading={status === 'loading'}
        pages={data?.pages || []}
        headerText="Replies"
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  );
}

Comment.propTypes = {
  dweetId: PropTypes.string.isRequired,
};

export default Comment;
