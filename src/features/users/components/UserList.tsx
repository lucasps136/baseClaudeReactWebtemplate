import { useEffect } from "react";

import { useUsers } from "../hooks";

// Simple UserList component following Single Responsibility
// Only renders user list UI
export const UserList = (): JSX.Element => {
  const { users, isLoadingUsers, usersError, fetchUsers, deleteUser } =
    useUsers();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoadingUsers) {
    return <div className="text-center p-4">Loading users...</div>;
  }

  if (usersError) {
    return (
      <div className="text-center p-4 text-red-600">Error: {usersError}</div>
    );
  }

  if (users.length === 0) {
    return <div className="text-center p-4 text-gray-500">No users found</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Users</h2>
      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 border rounded-lg flex justify-between items-start"
          >
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              {user.bio && (
                <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
              )}
            </div>
            <button
              onClick={() => deleteUser(user.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
