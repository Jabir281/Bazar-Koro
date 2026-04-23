import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Megaphone, Upload, CheckCircle } from "lucide-react";

export default function CreateAd() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    setSuccess(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-active-role": "marketer",
        },
        body: JSON.stringify({ imageUrl: preview }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload ad");
      }
      setSuccess(true);
      setPreview(null);
      setFileName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-main font-['Plus_Jakarta_Sans'] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-primary/20">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-3 bg-surface neomorph-raised hover:neomorph-inset rounded-full text-primary transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Megaphone className="w-8 h-8 text-primary" />
              Launch a Campaign
            </h1>
            <p className="text-sm font-medium text-muted">
              Upload promotional content. It will fade-in for users browsing the marketplace.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl neomorph-inset text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl neomorph-inset text-green-600 text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Ad is now live on the marketplace.
          </div>
        )}

        <div className="neomorph-raised rounded-3xl p-8 space-y-6">
          <label className="block">
            <div className="neomorph-inset rounded-2xl p-8 text-center cursor-pointer hover:opacity-90 transition-opacity">
              <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="font-bold text-main">
                {fileName || "Click to choose an image or PDF"}
              </p>
              <p className="text-xs text-muted mt-1">PNG, JPG, GIF or PDF</p>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>
          </label>

          {preview && (
            <div className="neomorph-inset rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
                Preview
              </p>
              {preview.startsWith("data:application/pdf") ? (
                <iframe src={preview} className="w-full h-[50vh] rounded-xl border-none" />
              ) : (
                <img
                  src={preview}
                  alt="Ad preview"
                  className="w-full max-h-[50vh] object-contain rounded-xl"
                />
              )}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!preview || uploading}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold neomorph-raised active:neomorph-inset transition-all disabled:opacity-50"
          >
            {uploading ? "Publishing..." : "Publish Ad"}
          </button>
        </div>
      </div>
    </div>
  );
}
