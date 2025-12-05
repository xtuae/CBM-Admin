import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import OrdersHistory from '../pages/OrdersHistory';
import CreditLedger from '../pages/CreditLedger';
import WalletManagement from '../pages/WalletManagement';

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="orders" element={<OrdersHistory />} />
      <Route path="orders/:id" element={<OrdersHistory />} />
      <Route path="ledger" element={<CreditLedger />} />
      <Route path="wallet" element={<WalletManagement />} />
    </Routes>
  );
};

export default DashboardRoutes;
