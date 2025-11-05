'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Create the QuotaContext
export const QuotaContext = createContext();

// QuotaProvider component
export function QuotaProvider({ children }) {
  const { data: session, status } = useSession();
  const [basicQuota, setBasicQuota] = useState(0);
  const [proQuota, setProQuota] = useState(0);

  // Load quota values from session when authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setBasicQuota(session.user.basicRefinesRemaining || 0);
      setProQuota(session.user.proRefinesRemaining || 0);
    }
  }, [status, session]);

  // Function to decrement quota
  const spendQuota = (type) => {
    if (type === 'basic') {
      setBasicQuota((q) => Math.max(0, q - 1));
    } else if (type === 'pro') {
      setProQuota((q) => Math.max(0, q - 1));
    }
  };

  return (
    <QuotaContext.Provider value={{ basicQuota, proQuota, spendQuota }}>
      {children}
    </QuotaContext.Provider>
  );
}

// Custom hook to use the QuotaContext
export const useQuota = () => useContext(QuotaContext);
