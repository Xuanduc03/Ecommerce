import './App.scss';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { DefaultLayout as Layout } from './layout';
import { publicRoute } from './routes';
import AdminLayout from './layout/Admin/AdminLayout';
import { AdminRoutes } from './routes/AdminRoutes';
import ProtectedRoute from './routes/ProtectedRoute';

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
      </Routes>
    </div>
  );
}

export default App;
