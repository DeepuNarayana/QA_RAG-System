import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchAllUsers, updateUserRole, deleteUser, User } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Button from '@/components/Button';
import { useError } from '@/context/ErrorContext';

export default function AdminUsersPage() {
  const { addError } = useError();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', page],
    queryFn: () => fetchAllUsers(page, 10),
  });

  const updateRoleMutation = useMutation({
    mutationFn: (params: { userId: number; role: 'user' | 'admin' }) =>
      updateUserRole(params.userId, params.role),
    onSuccess: () => {
      addError({
        message: 'User role updated successfully',
        type: 'info',
        duration: 3000,
      });
      setSelectedUser(null);
      refetch();
    },
    onError: (error: any) => {
      addError({
        message: error.message || 'Failed to update user role',
        type: 'error',
        duration: 5000,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      addError({
        message: 'User deleted successfully',
        type: 'info',
        duration: 3000,
      });
      refetch();
    },
    onError: (error: any) => {
      addError({
        message: error.message || 'Failed to delete user',
        type: 'error',
        duration: 5000,
      });
    },
  });

  const handleRoleChange = (user: User) => {
    const currentRole = user.role;
    setSelectedUser(user);
    setNewRole(currentRole === 'admin' ? 'user' : 'admin');
  };

  const handleConfirmRoleChange = () => {
    if (selectedUser) {
      updateRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
    }
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const users = data?.users || [];
  const totalPages = data?.total_pages || 1;

  return (
    <ProtectedRoute requiredRole="admin">
      <Head>
        <title>User Management - Lumina Library Admin</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and assign roles</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin">
              <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user: User) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                              {user.full_name?.[0] || user.email?.[0]}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm gap-2 flex">
                          <button
                            onClick={() => handleRoleChange(user)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition"
                            disabled={updateRoleMutation.isPending}
                          >
                            Change Role
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 font-medium transition"
                            disabled={deleteUserMutation.isPending}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}

        {/* Role Change Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h2 className="text-xl font-bold mb-4">Change User Role</h2>
              <p className="text-gray-600 mb-4">
                Change role for <strong>{selectedUser.full_name}</strong> from{' '}
                <strong>{selectedUser.role}</strong> to <strong>{newRole}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={updateRoleMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRoleChange}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
