import client from 'api/client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import pick from 'lodash/pick';
import { getFilteredQuery, objToQueryString } from './queryHelpers';
import { useAlert } from 'context/AlertContext';
import { useUser } from 'context/UserContext';

function useFeedDweets() {
  const fetchFeedDweets = ({ pageParam = 1 }) =>
    client.get(`/dweets/feed?page=${pageParam}`).then((res) => res.data);

  return useInfiniteQuery(['dweets', 'feed'], fetchFeedDweets, {
    getNextPageParam: ({ page, totalPages }) =>
      page < totalPages ? page + 1 : undefined,
  });
}

function useDweets(query = {}) {
  const pickedQuery = pick(query, [
    'sortBy',
    'limit',
    'author',
    'likes',
    'redweets',
    'replyTo',
  ]);

  const filteredQuery = getFilteredQuery(pickedQuery);

  const fetchDweets = ({ pageParam = 1 }) => {
    const queryString = objToQueryString({ ...filteredQuery, page: pageParam });

    return client.get(`/dweets?${queryString}`).then((res) => res.data);
  };

  return useInfiniteQuery(['dweets', filteredQuery], fetchDweets, {
    getNextPageParam: ({ page, totalPages }) =>
      page < totalPages ? page + 1 : undefined,
  });
}

function useDweet(id) {
  return useQuery(['dweets', id], () =>
    client.get(`/dweets/${id}`).then((res) => res.data)
  );
}

function useCreateDweet() {
  const queryClient = useQueryClient();
  return useMutation((newDweet) => client.post('/dweets', newDweet), {
    onSuccess: () => {
      queryClient.invalidateQueries('dweets');
    },
  });
}

function useRemoveDweet(queryKey = ['dweets', {}]) {
  const queryClient = useQueryClient();
  const { setAlert } = useAlert();

  return useMutation((dweetId) => client.delete(`/dweets/${dweetId}`), {
    onMutate: async (dweetId) => {
      if (typeof queryKey[1] === 'string') {
        // Single dweet
        return;
      }

      await queryClient.cancelQueries(queryKey);

      const previousDweets = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          results: page.results.filter((dweet) => dweet._id !== dweetId),
        })),
      }));

      return { previousDweets };
    },
    onError: (_err, _dweetId, context) => {
      setAlert({ type: 'error', msg: 'Something went wrong...' });
      if (context.previousDweets) {
        queryClient.setQueryData(queryKey, context.previousDweets);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('dweets');
    },
  });
}

function useDweetLike(queryKey = ['dweets', {}]) {
  const queryClient = useQueryClient();
  const authUser = useUser();
  const { setAlert } = useAlert();

  return useMutation((dweetId) => client.post(`/dweets/like/${dweetId}`), {
    onMutate: async (dweetId) => {
      await queryClient.cancelQueries(queryKey);

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (old.dweet) {
          // Singledweet
          return {
            ...old,
            dweet: {
              ...old.dweet,
              likes: [...old.dweet.likes, authUser._id],
            },
          };
        } else {
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((dweet) => {
                if (dweet._id !== dweetId) return dweet;

                return {
                  ...dweet,
                  likes: [...dweet.likes, authUser._id],
                };
              }),
            })),
          };
        }
      });

      return { previousData };
    },
    onError: (_err, _dweetId, context) => {
      setAlert({ type: 'error', msg: 'Something went wrong...' });
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries('dweets');
    },
  });
}

function useDweetUnlike(queryKey = ['dweets', {}]) {
  const queryClient = useQueryClient();
  const authUser = useUser();
  const { setAlert } = useAlert();

  return useMutation((dweetId) => client.delete(`/dweets/like/${dweetId}`), {
    onMutate: async (dweetId) => {
      await queryClient.cancelQueries(queryKey);

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (old.dweet) {
          return {
            ...old,
            dweet: {
              ...old.dweet,
              likes: old.dweet.likes.filter((id) => id !== authUser._id),
            },
          };
        } else {
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((dweet) => {
                if (dweet._id !== dweetId) return dweet;

                return {
                  ...dweet,
                  likes: dweet.likes.filter((id) => id !== authUser._id),
                };
              }),
            })),
          };
        }
      });

      return { previousData };
    },
    onError: (_err, _dweetId, context) => {
      setAlert({ type: 'error', msg: 'Something went wrong...' });
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries('dweets');
    },
  });
}

export {
  useFeedDweets,
  useDweets,
  useDweet,
  useCreateDweet,
  useRemoveDweet,
  useDweetLike,
  useDweetUnlike,
};
