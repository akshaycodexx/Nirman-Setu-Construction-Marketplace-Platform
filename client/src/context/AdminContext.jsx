import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/admin/me')
        .then(({ data }) => setAdmin(data.admin))
        .catch(() => { localStorage.removeItem('adminToken'); delete axios.defaults.headers.common['Authorization']; })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginAdmin = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAdmin(adminData);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
