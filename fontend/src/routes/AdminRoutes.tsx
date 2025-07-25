import CategoriesManager from "../pages/admin/CategoryManager";
import AdminDashboard from "../pages/admin/Dashboard";
import DiscountManagement from "../pages/admin/DiscountManager";
import OrderManager from "../pages/admin/OrdersManager";
import ProductManagement from "../pages/admin/ProductsManager";
import SellerManagement from "../pages/admin/SellersManager";
import ShopManagement from "../pages/admin/ShopManager";
import UsersManager from "../pages/admin/UsersManager";
import  type { IRoute } from "./routes";


const AdminRoutes : IRoute[] = [
    {path: "/admin", component: AdminDashboard},
    {path: "/admin/users", component: UsersManager},
    {path: "/admin/sellers", component: SellerManagement},
    {path: "/admin/products", component: ProductManagement},
    {path: "/admin/categories", component: CategoriesManager},
    {path: "/admin/shops", component: ShopManagement},
    {path: "/admin/orders", component: OrderManager},
    {path: '/admin/discount', component: DiscountManagement},
];

export {AdminRoutes};