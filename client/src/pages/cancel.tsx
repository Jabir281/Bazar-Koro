import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']">
      <div className="max-w-md w-full neomorph-raised rounded-3xl p-8 text-center space-y-6">
        <div className="w-24 h-24 mx-auto neomorph-inset rounded-full flex items-center justify-center text-red-500">
          <XCircle className="w-12 h-12" />
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold text-main mb-2">Payment Cancelled</h1>
          <p className="text-muted font-medium">
            You cancelled the checkout process. Don't worry, no charges were made to your account.
          </p>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            onClick={() => navigate("/cart")}
            className="flex-1 bg-surface text-primary py-4 rounded-xl neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all font-extrabold text-lg"
          >
            Back to Cart
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 bg-primary text-white py-4 rounded-xl neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all font-extrabold text-lg"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}