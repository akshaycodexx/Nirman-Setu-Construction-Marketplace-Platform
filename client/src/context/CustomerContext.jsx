import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customerToken');
    if (!token) { setLoading(false); return; }
    axios.get('/api/customer/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCustomer(r.data))
      .catch(() => localStorage.removeItem('customerToken'))
      .finally(() => setLoading(false));
  }, []);

  const loginCustomer = (token, data) => {
    localStorage.setItem('customerToken', token);
    setCustomer(data);
  };

  const logoutCustomer = () => {
    localStorage.removeItem('customerToken');
    setCustomer(null);
  };

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('customerToken')}`,
  });

  return (
    <CustomerContext.Provider value={{ customer, loading, loginCustomer, logoutCustomer, authHeader }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);
