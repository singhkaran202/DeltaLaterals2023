import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { FaRegComment, FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import {
  Container,
  HeaderWrapper,
  Header,
  List,
  ListItem,
  ListItemContent,
  DweetUserGroup,
  DweetText,
  DweetBottomGroup,
  DweetUserName,
  DweetUserUsername,
  ItemGroup,
  DeleteButton,
} from './style';
import {
  InfoText,
  UserAvatar,
  Icon,
  LikeIcon,
  Button,
} from 'shared/components';
import Loading from 'components/Loading';
import portraitPlaceholder from 'img/portrait-placeholder.png';
import { useUser } from 'context/UserContext';
import { useRemoveDweet, useDweetLike, useDweetUnlike } from 'utils/dweets';
import useIntersectionObserver from 'hooks/useIntersectionObserver';
import 'styled-components/macro';

function SingleDweet({ dweet, queryKey }) {
  const user = useUser();
  const history = useHistory();
  const location = useLocation();
  const removeDweetMutation = useRemoveDweet(queryKey);
  const likeDweetMutation = useDweetLike(queryKey);
  const unlikeDweetMutation = useDweetUnlike(queryKey);

  const handleDweetClick = (dweet) => {
    const { author, _id: dweetId } = dweet;
    if (!author) return;

    history.push({
      pathname: `/${author._id}/status/${dweetId}`,
      state: { background: location },
    });
  };

  const handleActionClick = (action, dweetId) => (e) => {
    e.stopPropagation();
    if (!dweet.author) return;

    if (!user) {
      return history.push({
        pathname: '/signin',
      });
    }

    if (action === 'like') {
      likeDweetMutation.mutate(dweetId);
    } else if (action === 'unlike') {
      unlikeDweetMutation.mutate(dweetId);
    } else if (action === 'remove') {
      removeDweetMutation.mutate(dweetId);
    }
  };
  const owner = user && user._id === dweet.author?._id;
  const liked = !!(user && dweet.likes.includes(user._id));

  return (
    <ListItem key={dweet._id} onClick={() => handleDweetClick(dweet)}>
      <UserAvatar
        small
        src={dweet.author?.avatar || portraitPlaceholder}
        alt="User Avatar"
      />
      <ListItemContent>
        <DweetUserGroup>
          <ItemGroup>
            <DweetUserName>{dweet.author?.name || 'unknown'}</DweetUserName>
          </ItemGroup>
          <ItemGroup>
            @
            <DweetUserUsername>
              {dweet.author?.username || 'unknown'}
            </DweetUserUsername>
          </ItemGroup>
          <ItemGroup>
            <span>{format(new Date(dweet.createdAt), 'dd MMMM yyyy')}</span>
          </ItemGroup>
        </DweetUserGroup>
        <div>
          <DweetText>{dweet.text}</DweetText>
        </div>
        <DweetBottomGroup>
          <button disabled={!dweet.author}>
            <Icon as={FaRegComment} /> <span>{dweet.repliesCount}</span>
          </button>
          <button
            onClick={handleActionClick(liked ? 'unlike' : 'like', dweet._id)}
            disabled={!dweet.author}
          >
            <LikeIcon liked={liked}>
              {liked ? <FaHeart /> : <FaRegHeart />}
            </LikeIcon>{' '}
            {dweet.likes.length}
          </button>
        </DweetBottomGroup>
      </ListItemContent>
      {owner ? (
        <DeleteButton
          onClick={handleActionClick('remove', dweet._id)}
          disabled={removeDweetMutation.isLoading || !dweet.author}
        >
          <IoMdClose />
        </DeleteButton>
      ) : null}
    </ListItem>
  );
}

SingleDweet.defaultProps = {
  queryKey: ['dweets', {}],
};

SingleDweet.propTypes = {
  dweet: PropTypes.object.isRequired,
  queryKey: PropTypes.array,
};

function DweetsBoard({
  loading,
  pages,
  headerText,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  queryKey,
}) {
  const loadMoreRef = useRef();

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: fetchNextPage,
    enabled: hasNextPage,
  });

  const numberOfDweets =
    pages?.reduce((acc, page) => acc + page.results.length, 0) ?? 0;

  return (
    <Container>
      <HeaderWrapper>
        <Header>{headerText}</Header>
      </HeaderWrapper>
      {loading ? (
        <Loading isSmall isFixed={false} />
      ) : (
        <>
          <List>
            {numberOfDweets > 0 ? (
              <>
                {pages.map((group, i) => (
                  <React.Fragment key={i}>
                    {group.results.map((dweet) => (
                      <SingleDweet
                        key={dweet._id}
                        dweet={dweet}
                        queryKey={queryKey}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </>
            ) : (
              <InfoText>There are no dweets to display</InfoText>
            )}
          </List>
          {numberOfDweets > 0 && (
            <div
              css={`
                margin-top: 15px;
                display: flex;
                justify-content: center;
              `}
            >
              <Button
                ref={loadMoreRef}
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
              >
                {isFetchingNextPage
                  ? 'Loading more...'
                  : hasNextPage
                  ? 'Load More'
                  : 'Nothing more to load'}
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

DweetsBoard.defaultProps = {
  headerText: 'Dweets',
  queryKey: ['dweets', {}],
};

DweetsBoard.propTypes = {
  queryKey: PropTypes.array,
  loading: PropTypes.bool.isRequired,
  pages: PropTypes.array.isRequired,
  headerText: PropTypes.string.isRequired,
  fetchNextPage: PropTypes.func.isRequired,
  hasNextPage: PropTypes.bool,
  isFetchingNextPage: PropTypes.bool.isRequired,
};

export default DweetsBoard;
