import CategoriesManager from "../pages/admin/CategoryManager";
import AdminDashboard from "../pages/admin/Dashboard";
import SellerManagement from "../pages/admin/SellersManager";
import UsersManager from "../pages/admin/UsersManager";
import DashboardSeller from "../pages/seller/DashboardSeller";
import  type { IRoute } from "./routes";


const SellerRoutes : IRoute[] = [
    {path: "/seller", component: DashboardSeller },
    {path: "/seller/users", component: UsersManager},
    {path: "/admin/sellers", component: SellerManagement},
    {path: "/admin/category", component: CategoriesManager}

];

export {SellerRoutes};