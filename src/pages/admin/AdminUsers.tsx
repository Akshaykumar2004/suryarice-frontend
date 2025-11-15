import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, Users, Phone, MapPin, Calendar, Shield } from 'lucide-react';

interface User {
  id: string;
  mobile_number: string;
  name: string;
  email: string;
  city: string;
  state: string;
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [filterType]);

  const fetchUsers = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterType !== 'all') {
        if (filterType === 'verified') params.is_verified = true;
        if (filterType === 'unverified') params.is_verified = false;
        if (filterType === 'staff') params.is_staff = true;
      }

      const response = await api.get('/admin/users/', { params });
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/`, {
        is_active: !currentStatus
      });
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_active: !currentStatus }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  const toggleUserVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/`, {
        is_verified: !currentStatus
      });

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, is_verified: !currentStatus }
            : user
        )
      );
    } catch (error) {
      console.error('Error updating user verification:', error);
      alert('Failed to update user verification status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          
          <div className="flex space-x-4">
            {/* Search */}
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Search
              </button>
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Users</p>
                <p className="text-2xl font-bold text-blue-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Verified</p>
                <p className="text-2xl font-bold text-green-900">
                  {users.filter(u => u.is_verified).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Active</p>
                <p className="text-2xl font-bold text-orange-900">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Staff</p>
                <p className="text-2xl font-bold text-purple-900">
                  {users.filter(u => u.is_staff).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {(user.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Unnamed User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{user.mobile_number}</div>
                        {user.email && (
                          <div className="text-sm text-gray-500">{user.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {user.city && user.state 
                          ? `${user.city}, ${user.state}`
                          : 'Not provided'
                        }
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {user.is_staff && (
                        <>
                          <br />
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            Staff
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          user.is_active
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => toggleUserVerification(user.id, user.is_verified)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          user.is_verified
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {user.is_verified ? 'Mark Unverified' : 'Mark Verified'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">No users match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;