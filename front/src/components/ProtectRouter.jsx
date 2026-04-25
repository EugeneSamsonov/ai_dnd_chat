import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const ProtectedRoute = ({ 
  requireAdmin = false,
  checkMembership = false,
  checkBan = true
}) => {
  const { roomId } = useParams();

  const { data: participant, isLoading, error } = useQuery({
    queryKey: ['current_participant', roomId],
    queryFn: () => api.get(`rooms/${roomId}/participants/me/`).then(res => res.data),
    enabled: !!roomId, // Запрос идет только если есть ID комнаты
    retry: false
  });

  if (isLoading) return <div>Проверка прав доступа...</div>;

  
  if (checkMembership && (error || !participant)) {
    return <Navigate to={`/join/${roomId}`} replace />;
  }

  if (checkBan && participant?.is_banned) {
    return <Navigate to="/banned" replace />;
  }

  if (requireAdmin && !participant?.is_room_admin) {
    return <Navigate to={`/rooms/${roomId}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;