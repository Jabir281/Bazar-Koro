import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
<<<<<<< HEAD
import SearchPage from './pages/SearchPage';
import ProductDetail from './pages/ProductDetail';

=======
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateStore from "./pages/CreateStore";
import StoreView from "./pages/StoreView";
import BuyerStoreView from "./pages/BuyerStoreView";
>>>>>>> 2fef71fe83e9cf94cd8925093b644a31cb050982

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
<<<<<<< HEAD
        <Route path="/search" element={<SearchPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
=======
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seller/create-store" element={<CreateStore />} />
        <Route path="/seller/stores/:storeId" element={<StoreView />} />
        <Route path="/buyer/stores/:storeId" element={<BuyerStoreView />} />
>>>>>>> 2fef71fe83e9cf94cd8925093b644a31cb050982
      </Routes>
    </BrowserRouter>
  );
}

export default App;
