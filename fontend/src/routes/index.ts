import CheckOut from "../components/CheckOut";
import { CartPage } from "../pages/CartPage";
import { Home } from "../pages/HomePage";
import { Products } from "../pages/ProductDetailPage";
import SignUp  from "../components/Auth/SignUp";
import  type { IRoute } from "./routes";
import Login from "../components/Auth/Login";
import ForgotPassword from "../components/Auth/ForgotPassword";
import CreateShopForm from "../components/Shop/CreateShopForm";
import CategoryProduct from "../components/Category/ListProductByCategory";

const publicRoute : IRoute[] = [
    {path: "/", component: Home},
    {path: '/product/:id', component: Products},
    {path: '/login', component: Login, layout: null},
    {path: '/forgot-password', component: ForgotPassword, layout: null},
    {path: '/signup', component: SignUp, layout: null},
    {path: '/cart', component: CartPage},
    {path: '/category/collectibles', component: CategoryProduct},
    {path: '/checkout', component: CheckOut},
    {path: "/create-shop", component: CreateShopForm, layout: null}
];

export {publicRoute};