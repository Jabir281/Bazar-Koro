import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']">
      <div className="max-w-md w-full neomorph-raised rounded-3xl p-8 text-center space-y-6">
        <div className="w-24 h-24 mx-auto neomorph-inset rounded-full flex items-center justify-center text-green-500">
          <CheckCircle className="w-12 h-12" />
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold text-main mb-2">Payment Successful!</h1>
          <p className="text-muted font-medium">
            Thank you for your purchase. Your payment has been processed securely via Stripe.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-primary text-white py-4 rounded-xl neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all font-extrabold text-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}