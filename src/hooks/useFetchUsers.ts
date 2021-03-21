import { useState, useEffect } from 'react';
import { useAsyncCall } from './useAsyncCall';
import { firebase } from '../firebase/config';
import { UserInfo } from '../types';
import { getError, getLastItem, isAdmin } from '../helpers';
import { snapshotToDoc, userCountsRef, usersRef } from '../firebase';

interface HookReturn {
  loading: boolean;
  error: string;
  userCounts: number;
  users: UserInfo[] | null;
  queryMoreUsers: () => void;
}

export const userQueryLimit = 30;

export const useFetchUsers = (userInfo: UserInfo): HookReturn => {
  const { loading, setLoading, error, setError } = useAsyncCall();

  const [users, setUsers] = useState<UserInfo[] | null>(null);
  const [userCounts, setUserCounts] = useState(0);
  const [
    lastDocument,
    setLastDocument,
  ] = useState<firebase.firestore.DocumentData>();

  // Next query
  const queryMoreUsers = async () => {
    try {
      if (!lastDocument) return;
      setLoading(true);
      const snapshots = await usersRef
        .orderBy('createdAt', 'desc')
        .startAfter(lastDocument)
        .limit(userQueryLimit)
        .get();
      const newUsers = snapshots.docs.map((snapshot) =>
        snapshotToDoc<UserInfo>(snapshot)
      );
      const lastVisible = getLastItem<firebase.firestore.QueryDocumentSnapshot>(
        snapshots.docs
      );
      setLastDocument(lastVisible);
      // combine new users with existing users
      setUsers((prev) => (prev ? [...prev, ...newUsers] : newUsers));
    } catch (err) {
      const message = getError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Query the users collection (first query)
  useEffect(() => {
    if (!userInfo || !isAdmin(userInfo.role)) {
      setUsers(null);
      return;
    }

    setLoading(true);
    const unsubscribe = usersRef
      .orderBy('createdAt', 'desc')
      .limit(userQueryLimit)
      .onSnapshot({
        next: (snapshots) => {
          const users = snapshots.docs.map((snapshot) =>
            snapshotToDoc<UserInfo>(snapshot)
          );
          const lastVisible = getLastItem<firebase.firestore.QueryDocumentSnapshot>(
            snapshots.docs
          );
          setLastDocument(lastVisible);
          setUsers(users);
          setLoading(false);
        },
        error: (err) => {
          setError(err.message);
          setUsers(null);
          setLoading(false);
        },
      });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!userInfo || !isAdmin(userInfo.role)) {
      setUserCounts(0);
      return;
    }
    const unsubscribe = userCountsRef.doc('counts').onSnapshot({
      next: (snapshot) => {
        const { userCounts } = snapshot.data() as { userCounts: number };
        setUserCounts(userCounts);
      },
      error: (err) => {
        setError(err.message);
        setUserCounts(0);
        setLoading(false);
      },
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  return { loading, error, users, userCounts, queryMoreUsers };
};
