import CategoriesManager from "../pages/admin/CategoryManager";
import AdminDashboard from "../pages/admin/Dashboard";
import SellerManagement from "../pages/admin/SellersManager";
import UsersManager from "../pages/admin/UsersManager";
import  type { IRoute } from "./routes";


const AdminRoutes : IRoute[] = [
    {path: "/admin", component: AdminDashboard},
    {path: "/admin/users", component: UsersManager},
    {path: "/admin/sellers", component: SellerManagement},
    {path: "/admin/category", component: CategoriesManager}

];

export {AdminRoutes};