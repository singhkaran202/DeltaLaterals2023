import React from 'react';
import DisplayError from 'components/DisplayError';
import DweetsBoard from 'components/DweetsBoard';
import { Container } from 'shared/layout';
import 'styled-components/macro';
import { useDweets } from 'utils/dweets';

function Homepage() {
  const {
    data,
    error,
    status,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDweets();

  return (
    <Container>
      {error ? (
        <DisplayError error={error} />
      ) : (
        <div
          css={`
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #eee;
          `}
        >
          <DweetsBoard
            queryKey={['dweets', {}]}
            loading={status === 'loading'}
            pages={data?.pages || []}
            isFetching={isFetching}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        </div>
      )}
    </Container>
  );
}

export default Homepage;
