import PropTypes from 'prop-types';
import 'styled-components/macro';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import '@reach/dialog/styles.css';
import DisplayError from 'components/DisplayError';
import Loading from 'components/Loading';
import { useUser } from 'context/UserContext';
import { format } from 'date-fns';
import portraitPlaceholder from 'img/portrait-placeholder.png';
import React from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { CloseButton, UserAvatar, Icon, LikeIcon } from 'shared/components';
import { useDweet, useDweetLike, useDweetUnlike } from 'utils/dweets';
import Comment from './Comment';
import {
  ItemGroup,
  Main,
  SocialGroup,
  StyledDweet,
  TopFlex,
  DweetAction,
  DweetActionGroup,
  DweetContent,
  DweetDate,
  DweetText,
  DweetUserName,
  DweetUserUsername,
  UserGroup,
  UserInfo,
} from './style';
import { FaHeart, FaRegComment, FaRegHeart } from 'react-icons/fa';
import { queries } from 'shared/layout';

function DisplayDweet({ dweetId }) {
  const history = useHistory();
  const user = useUser();
  const { isLoading, data, error } = useDweet(dweetId);
  const dweetLikeMutation = useDweetLike(['dweets', dweetId]);
  const unlikeDweetMutation = useDweetUnlike(['dweets', dweetId]);

  const handleActionClick = (action) => (e) => {
    e.stopPropagation();
    if (!user) {
      return history.push('/signin');
    }

    if (action === 'like') {
      dweetLikeMutation.mutate(dweetId);
    } else if (action === 'unlike') {
      unlikeDweetMutation.mutate(dweetId);
    }
  };

  if (error) {
    return <DisplayError error={error} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  const {
    author: { _id: authorId, name, username, avatar },
    repliesCount,
    likes,
    createdAt,
    text,
  } = data.dweet;

  const liked = !!(user && likes.includes(user._id));

  return (
    <StyledDweet>
      {dweetLikeMutation.isError && (
        <DisplayError error={dweetLikeMutation.error} />
      )}

      {unlikeDweetMutation.isError && (
        <DisplayError error={dweetLikeMutation.error} />
      )}
      <Main>
        <TopFlex>
          <UserGroup>
            <Link to={`/profile/${authorId}`}>
              <UserAvatar
                small
                src={avatar || portraitPlaceholder}
                alt={`${name}'s avatar`}
              />
            </Link>

            <UserInfo>
              <ItemGroup>
                <DweetUserName as={Link} to={`/profile/${authorId}`}>
                  {name}
                </DweetUserName>
              </ItemGroup>
              <ItemGroup>
                @
                <DweetUserUsername as={Link} to={`/profile/${authorId}`}>
                  {username}
                </DweetUserUsername>
              </ItemGroup>
            </UserInfo>
          </UserGroup>
        </TopFlex>

        <DweetContent>
          <DweetText>{text}</DweetText>
          <DweetDate>{format(new Date(createdAt), 'dd MMMM yyyy')}</DweetDate>

          <SocialGroup>
            <ItemGroup>
              <strong>{likes.length}</strong> Likes
            </ItemGroup>
          </SocialGroup>

          <DweetActionGroup>
            <DweetAction>
              <Icon>
                <FaRegComment />
              </Icon>{' '}
              <span>{repliesCount}</span>
            </DweetAction>
            <DweetAction
              as="button"
              onClick={handleActionClick(liked ? 'unlike' : 'like')}
            >
              <LikeIcon liked={liked}>
                {liked ? <FaHeart /> : <FaRegHeart />}
              </LikeIcon>{' '}
              <span>{likes.length}</span>
            </DweetAction>
          </DweetActionGroup>
        </DweetContent>
      </Main>

      <Comment dweetId={dweetId} />
    </StyledDweet>
  );
}

DisplayDweet.propTypes = {
  dweetId: PropTypes.string.isRequired,
};

export function DweetModal() {
  const history = useHistory();
  const { dweetId } = useParams();

  const back = (e) => {
    if (e) e.stopPropagation();
    history.goBack();
  };

  return (
    <DialogOverlay onDismiss={back}>
      <CloseButton onClick={back} />
      <DialogContent
        aria-label="Dweet"
        css={`
          width: 100%;
          max-width: 600px;
          border-radius: 5px;
          ${[queries.tiny]} {
            padding: 1rem;
          }
        `}
      >
        <DisplayDweet dweetId={dweetId} />
      </DialogContent>
    </DialogOverlay>
  );
}

export default DisplayDweet;
