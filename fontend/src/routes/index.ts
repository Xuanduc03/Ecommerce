import CheckOut from "../components/CheckOut";
import { CartPage } from "../pages/CartPage";
import { Home } from "../pages/HomePage";
import { ProductDetailPage } from "../pages/ProductDetailPage";
import SignUp  from "../components/Auth/SignUp";
import  type { IRoute } from "./routes";
import Login from "../components/Auth/Login";
import ForgotPassword from "../components/Auth/ForgotPassword";
import CreateShopForm from "../components/Shop/CreateShopForm";
import CategoryProduct from "../components/Category/ListProductByCategory";
import ShopPage from "../pages/ShopPage";
import { ProfilePage } from "../pages/ProfilePage";
import ResetPasswordWithToken from "../components/Auth/ResetPassword";
import MyOrder from "../components/OrderBuyer/MyOrder";

const publicRoute : IRoute[] = [
    {path: "/", component: Home},
    {path: '/product/:id', component: ProductDetailPage},
    {path: '/login', component: Login, layout: null},
    {path: '/forgot-password', component: ForgotPassword, layout: null},
    {path: '/reset-password', component: ResetPasswordWithToken, layout: null},
    {path: '/signup', component: SignUp, layout: null},
    {path: '/cart', component: CartPage},
    {path: '/order', component: MyOrder},
    {path: "/shop/:shopId", component: ShopPage},
    {path: '/me', component: ProfilePage},
    {path: '/category/:slug', component: CategoryProduct},
    {path: '/checkout', component: CheckOut, layout: null},
    {path: "/create-shop", component: CreateShopForm, layout: null}
];

export {publicRoute};