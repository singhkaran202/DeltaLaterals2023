import React from 'react';
import { useParams } from 'react-router-dom';
import DweetsBoard from 'components/DweetsBoard';
import { DisplayError } from 'shared/components';
import { ProfileDweetsBoard } from './style';
import { useDweets } from 'utils/dweets';

function ProfileDweets() {
  const { userId } = useParams();
  const {
    data,
    status,
    error,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDweets({ author: userId });

  if (error) {
    return <DisplayError error={error} />;
  }

  return (
    <ProfileDweetsBoard>
      <DweetsBoard
        queryKey={['dweets', { author: userId }]}
        loading={status === 'loading'}
        pages={data?.pages || []}
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    </ProfileDweetsBoard>
  );
}

export default ProfileDweets;
