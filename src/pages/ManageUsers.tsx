import { useState, useEffect } from 'react';
import User from '../components/manage-users/User';
import Spinner from '../components/Spinner/Spinner';
import Pagination from '../components/Pagination';
import { useSearchContext } from '../state/search-context';
import { useFetchUsers } from '../hooks/useFetchUsers';
import { usePagination } from '../hooks/usePagination';
import { UserInfo } from '../types';

export const usersPerPage = 1;

interface Props {
  userInfo: UserInfo;
}

const ManageUsers = ({ userInfo }: Props) => {
  const { loading, error, users, userCounts, queryMoreUsers } = useFetchUsers(
    userInfo
  );

  const { searchedItems } = useSearchContext();

  const { page, totalPages } = usePagination(
    userCounts,
    usersPerPage,
    undefined,
    searchedItems as UserInfo[]
  );

  const [usersByPage, setUsersByPage] = useState(users);
  const [paginatedSearchedItems, setPaginatedSearchedItems] = useState(
    searchedItems
  );

  useEffect(() => {
    const startIndex = usersPerPage * (page - 1);
    const endIndex = usersPerPage * page;
    if (searchedItems) {
      setPaginatedSearchedItems(searchedItems.slice(startIndex, endIndex));
      setUsersByPage([]);
    } else {
      if (!users) return;

      if (users.length < userCounts && users.length < usersPerPage * page) {
        return queryMoreUsers();
      }

      // Check if we need to query more users
      setUsersByPage(users.slice(startIndex, endIndex));
      setPaginatedSearchedItems(null);
    }
    // eslint-disable-next-line
  }, [searchedItems, users, page, userCounts]);

  if (loading) return <Spinner color="grey" height={50} width={50} />;

  if (error) return <h2 className="header--center">{error}</h2>;

  if (!users || users.length === 0)
    return <h2 className="header--center">No users found</h2>;

  return (
    <div className="page--manage-users">
      <h2 className="header--center">Manage users</h2>
      <Pagination page={page} totalPages={totalPages} />
      <table className="table table--manage-users">
        <thead>
          <tr>
            {/* Header */}
            <th className="table-cell" style={{ width: '20%' }} rowSpan={2}>
              Name
            </th>
            <th className="table-cell" style={{ width: '25%' }} rowSpan={2}>
              Email
            </th>
            <th className="table-cell" rowSpan={2}>
              Created At
            </th>

            <th className="table-cell" style={{ width: '25%' }} colSpan={3}>
              Role
            </th>
          </tr>

          {/* Sub header */}
          <tr>
            <th className="table-cell">Client</th>
            <th className="table-cell">Admin</th>
            <th className="table-cell">Super</th>
          </tr>
        </thead>

        <tbody>
          {paginatedSearchedItems ? (
            <>
              {paginatedSearchedItems.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <h2 className="header--center">No Users Found</h2>
                  </td>
                </tr>
              ) : (
                (paginatedSearchedItems as UserInfo[]).map((user) => (
                  <User key={user.id} user={user} admin={userInfo} />
                ))
              )}
            </>
          ) : (
            usersByPage?.map((user) => (
              <User key={user.id} user={user} admin={userInfo} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
