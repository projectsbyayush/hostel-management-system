import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './router/RequireAuth';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Rooms from './pages/Rooms';
import Allotments from './pages/Allotments';
import Fees from './pages/Fees';
import Complaints from './pages/Complaints';
import Receipt from './pages/Receipt';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/fees/:id/receipt" element={<Receipt />} />
      </Route>
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="allotments" element={<Allotments />} />
        <Route path="fees" element={<Fees />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
