import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId"); // Grabs the ID from the URL
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // If someone just types /success in the URL without paying, show an error
    if (!orderId) {
      setStatus("error");
      setErrorMsg("Missing order ID in URL.");
      return;
    }

    const confirmPayment = async () => {
      try {
        const token = localStorage.getItem("token"); // Grab the buyer's token
        
        const res = await fetch("/api/payment/payment-success", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        });

        if (res.ok) {
          setStatus("success");
          setErrorMsg(null);
        } else {
          setStatus("error");
          const data = await res.json().catch(() => null);
          setErrorMsg(data?.error || data?.message || "Unknown error");
        }
      } catch (error) {
        setStatus("error");
        setErrorMsg((error as Error)?.message || "Network error");
      }
    };

    // Run the function exactly once when the page loads
    confirmPayment();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']">
      <div className="max-w-md w-full neomorph-raised rounded-3xl p-8 text-center space-y-6">
        
        {/* Dynamic Icon based on Status */}
        <div className={`w-24 h-24 mx-auto neomorph-inset rounded-full flex items-center justify-center ${
          status === "success" ? "text-green-500" : 
          status === "error" ? "text-red-500" : "text-blue-500"
        }`}>
          {status === "loading" && <Loader2 className="w-12 h-12 animate-spin" />}
          {status === "success" && <CheckCircle className="w-12 h-12" />}
          {status === "error" && <AlertCircle className="w-12 h-12" />}
        </div>
        
        {/* Dynamic Text based on Status */}
        <div>
          {status === "loading" && (
            <>
              <h1 className="text-3xl font-extrabold text-main mb-2">Finalizing Order...</h1>
              <p className="text-muted font-medium">Please wait while we confirm your payment and send your receipt.</p>
            </>
          )}
          
          {status === "success" && (
            <>
              <h1 className="text-3xl font-extrabold text-main mb-2">Payment Successful!</h1>
              <p className="text-muted font-medium">
                Thank you for your purchase. Your payment has been processed securely via Stripe. A digital receipt has been sent to your email.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-3xl font-extrabold text-main mb-2">Something went wrong</h1>
              <p className="text-muted font-medium">
                We couldn't confirm your order details. If your card was charged, please contact support.
              </p>
              {errorMsg && (
                <div className="mt-2 text-sm text-red-500">
                  <strong>Error:</strong> {errorMsg}
                </div>
              )}
            </>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate("/dashboard")}
            disabled={status === "loading"}
            className={`w-full py-4 rounded-xl font-extrabold text-lg transition-all ${
              status === "loading" 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : "bg-primary text-white neomorph-raised hover:neomorph-inset active:neomorph-inset"
            }`}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}