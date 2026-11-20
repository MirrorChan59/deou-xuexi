import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useSession } from '@client/src/session/SessionContext';

const RequireSession = ({ children }: { children: ReactNode }) => {
  const { user } = useSession();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default RequireSession;
