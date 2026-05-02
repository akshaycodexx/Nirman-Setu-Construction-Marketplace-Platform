import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SupplierContext = createContext(null);

export function SupplierProvider({ children }) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('supplierToken');
    if (token) {
      axios.defaults.headers.common['x-supplier-token'] = token;
      const instance = axios.create({ headers: { Authorization: `Bearer ${token}` } });
      instance.get('/api/supplier/me')
        .then(({ data }) => setSupplier(data.supplier))
        .catch(() => localStorage.removeItem('supplierToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginSupplier = (token, supplierData) => {
    localStorage.setItem('supplierToken', token);
    setSupplier(supplierData);
  };

  const logoutSupplier = () => {
    localStorage.removeItem('supplierToken');
    setSupplier(null);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('supplierToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <SupplierContext.Provider value={{ supplier, loading, loginSupplier, logoutSupplier, getAuthHeaders }}>
      {children}
    </SupplierContext.Provider>
  );
}

export const useSupplier = () => useContext(SupplierContext);
