import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi';
import Loader from '../../components/Loader';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => adminApi.users(role ? { role } : {}).then(({ data }) => setUsers(data.data)).finally(() => setLoading(false));
  useEffect(() => { setLoading(true); load(); }, [role]);

  const toggleBlock = async (u) => {
    try {
      await adminApi.toggleBlock(u._id, !u.isBlocked, u.isBlocked ? undefined : 'Policy violation');
      toast.success(u.isBlocked ? 'User unblocked' : 'User blocked');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const toggleDelete = async (u) => {
    try {
      await adminApi.toggleDelete(u._id, u.isDeleted);
      toast.success(u.isDeleted ? 'User restored' : 'User deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {['', 'buyer', 'seller', 'repair_partner'].map((r) => (
          <button
            key={r || 'all'}
            onClick={() => setRole(r)}
            className={`rounded-full px-3 py-1.5 text-xs ${role === r ? 'bg-forest-700 text-white' : 'bg-forest-100 text-forest-700'}`}
          >
            {r || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="card flex flex-wrap items-center justify-between gap-2 p-3">
              <div>
                <p className="text-sm font-medium text-forest-800">{u.name} <span className="text-xs text-forest-400">({u.role})</span></p>
                <p className="text-xs text-forest-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.isBlocked && <span className="badge bg-red-100 text-red-700">Blocked</span>}
                {u.isDeleted && <span className="badge bg-forest-200 text-forest-700">Deleted</span>}
                <button className="btn btn-secondary text-xs" onClick={() => toggleBlock(u)}>
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button className="btn btn-danger text-xs" onClick={() => toggleDelete(u)}>
                  {u.isDeleted ? 'Restore' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
