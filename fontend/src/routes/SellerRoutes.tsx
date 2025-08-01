import AddProductStepForm from "../components/Product/AddProduct";
import DashboardSeller from "../pages/seller/DashboardSeller";
import OrderSellerManager from "../pages/seller/OrderSeller";
import ProductReview from "../pages/seller/ProductReview";
import ProductSeller from "../pages/seller/ProductSeller";
import SellerShopManager from "../pages/seller/ShopManagerSeller";
import  type { IRoute } from "./routes";


const SellerRoutes : IRoute[] = [
    {path: "/seller", component: DashboardSeller },
    {path: "/seller/products", component: ProductSeller},
    {path: "/seller/product/add", component: AddProductStepForm},
    {path: "/seller/orders", component: OrderSellerManager},
    {path: "/seller/shop", component: SellerShopManager},
    {path: "/seller/product/reviews", component: ProductReview},
];

export {SellerRoutes};