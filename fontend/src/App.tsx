import './App.scss';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { DefaultLayout as Layout } from './layout';
import { publicRoute } from './routes';
import AdminLayout from './layout/Admin/AdminLayout';
import { AdminRoutes } from './routes/AdminRoutes';
import ProtectedRoute from './routes/ProtectedRoute';
import { SellerRoutes } from './routes/SellerRoutes';
import SellerLayout from './layout/Seller/SellerLayout';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        {publicRoute.map((route, index) => {
          const Page = route.component;
          return (
            <Route
              key={index}
              path={route.path}
              element={
                <Layout>
                  <Page />
                  <ToastContainer />
                </Layout>
              }
            />
          );
        })}

        {AdminRoutes.map((route, index) => {
          const Page = route.component;
          return (
            <Route
              key={`admin-${index}`}
              path={route.path}
              element={
                <ProtectedRoute role="admin"> {/* ✅ Check quyền admin */}
                  <AdminLayout> {/* ✅ Layout riêng cho admin */}
                    <Page />
                    <ToastContainer />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
          );
        })}

        {SellerRoutes.map((route, index) => {
          const Page = route.component;
          return (
            <Route
              key={`seller-${index}`}
              path={route.path}
              element={
                <ProtectedRoute role="seller"> 
                  <SellerLayout> 
                    <Page />
                    <ToastContainer />
                  </SellerLayout>
                </ProtectedRoute>
              }
            />
          );
        })}
      </Routes>
    </div>
  );
}

export default App;
