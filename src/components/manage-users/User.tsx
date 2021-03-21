import React, { FC, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Role, UserInfo } from '../../types';
import Button from '../Button/Button';
import { useUpdateRole } from '../../hooks/useUpdateRole';

interface Props {
  user: UserInfo;
  admin: UserInfo;
}

const User: FC<Props> = ({ user, admin }) => {
  const { loading, error, updateRole } = useUpdateRole();
  const { username, email, createdAt, role } = user;
  const [newRole, setNewRole] = useState<Role>(role);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateRole = async () => {
    if (role === newRole) return;
    const finished = await updateRole(user.id, newRole);
    if (finished) setIsEditing(false);

    if (error) alert(error);
  };

  return (
    <tr>
      {/* User name */}
      <td className="table-cell" style={{ width: '20%' }}>
        {username}
      </td>

      {/* Email */}
      <td className="table-cell" style={{ width: '25%' }}>
        {email}
      </td>

      {/* CreatedAt */}
      <td className="table-cell">
        {createdAt && createdAt.toDate().toDateString()}
      </td>

      {/* Role - Client */}
      <td className="table-cell">
        {newRole === 'CLIENT' ? (
          <FontAwesomeIcon
            icon={['fas', 'check-circle']}
            size="1x"
            style={{
              cursor: isEditing ? 'pointer' : undefined,
              color: isEditing ? 'green' : undefined,
            }}
          />
        ) : isEditing ? (
          <FontAwesomeIcon
            icon={['fas', 'times-circle']}
            size="1x"
            onClick={() => setNewRole('CLIENT')}
            style={{
              cursor: 'pointer',
              color: 'red',
            }}
          />
        ) : (
          ''
        )}
      </td>

      {/* Role - Admin */}
      <td className="table-cell">
        {newRole === 'ADMIN' ? (
          <FontAwesomeIcon
            icon={['fas', 'check-circle']}
            size="1x"
            style={{
              cursor: isEditing ? 'pointer' : undefined,
              color: isEditing ? 'green' : undefined,
            }}
          />
        ) : isEditing ? (
          <FontAwesomeIcon
            icon={['fas', 'times-circle']}
            size="1x"
            onClick={() => setNewRole('ADMIN')}
            style={{
              cursor: 'pointer',
              color: 'red',
            }}
          />
        ) : (
          ''
        )}
      </td>

      {/* Role - Super Admin */}
      <td className="table-cell">
        {role === 'SUPER_ADMIN' ? (
          <FontAwesomeIcon icon={['fas', 'check-circle']} size="1x" />
        ) : (
          ''
        )}
      </td>

      {/* Edit */}
      {admin.role === 'SUPER_ADMIN' && (
        <td className="table-cell">
          {role !== 'SUPER_ADMIN' && (
            <>
              {' '}
              {!isEditing ? (
                <FontAwesomeIcon
                  icon={['fas', 'edit']}
                  size="1x"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsEditing(true)}
                />
              ) : (
                <div className="table__update-action">
                  <Button
                    width="40%"
                    height="2rem"
                    className="btn--cancel"
                    style={{ fontSize: '1rem' }}
                    disabled={loading}
                    onClick={() => {
                      setNewRole(role);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    width="40%"
                    height="2rem"
                    loading={loading}
                    className="btn--confirm"
                    style={{ fontSize: '1rem' }}
                    onClick={handleUpdateRole}
                    spinnerHeight={10}
                    spinnerWidth={10}
                    disabled={loading || role === newRole}
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </>
          )}
        </td>
      )}
    </tr>
  );
};

export default User;
