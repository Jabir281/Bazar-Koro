import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateStore from "./pages/CreateStore";
import StoreView from "./pages/StoreView";
import BuyerStoreView from "./pages/BuyerStoreView";
import Cart from "./pages/Cart";
import SearchPage from "./pages/SearchPage";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seller/create-store" element={<CreateStore />} />
        <Route path="/seller/stores/:storeId" element={<StoreView />} />
        <Route path="/buyer/stores/:storeId" element={<BuyerStoreView />} />
        <Route path="/buyer/cart" element={<Cart />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
