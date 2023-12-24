import { Navigate } from 'react-router';

import { useAuth } from '@/lib/auth';

export const Landing = () => {
  const { user } = useAuth();

  return (
    <Navigate to={user ? "/dashboard" : "/account/sign-in"} replace={true} />
  );
};
