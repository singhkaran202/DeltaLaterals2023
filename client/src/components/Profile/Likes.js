import React from 'react';
import { useParams } from 'react-router-dom';
import DweetsBoard from 'components/DweetsBoard';
import { ProfileDweetsBoard } from './style';
import { useDweets } from 'utils/dweets';
import DisplayError from 'components/DisplayError';

function Likes() {
  const { userId } = useParams();
  const {
    data,
    error,
    status,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDweets({ likes: userId });

  if (error) {
    return <DisplayError error={error} />;
  }

  return (
    <ProfileDweetsBoard>
      <DweetsBoard
        queryKey={['dweets', { likes: userId }]}
        loading={status === 'loading'}
        pages={data?.pages || []}
        headerText="Likes"
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
      />
    </ProfileDweetsBoard>
  );
}

export default Likes;
