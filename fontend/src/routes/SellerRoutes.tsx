import AddProductStepForm from "../components/Product/AddProduct";
import DashboardSeller from "../pages/seller/DashboardSeller";
import OrderSellerManager from "../pages/seller/OrderSeller";
import ProductSeller from "../pages/seller/ProductSeller";
import  type { IRoute } from "./routes";


const SellerRoutes : IRoute[] = [
    {path: "/seller", component: DashboardSeller },
    {path: "/seller/products", component: ProductSeller},
    {path: "/seller/product/add", component: AddProductStepForm},
    {path: "/seller/orders", component: OrderSellerManager}
];

export {SellerRoutes};