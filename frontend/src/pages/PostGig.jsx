import React, { useState, useEffect, useRef } from "react";
import Header from "../components/layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { addLocalGig, createGig } from "../store/gigsSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/layout/Footer";

const PostGig = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const creating = useSelector((s) => s.gigs?.creating);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [searchParams] = useSearchParams();
  const gigId = searchParams.get("id");

  const [updating, setUpdating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || []);
    const totalNow = list.length + files.length + (existingImages.length || 0);
    if (totalNow > 3) {
      toast.error('Maximum 3 images allowed');
      // clear input selection to avoid confusion
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const withPreview = list.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    setFiles((prev) => prev.concat(withPreview));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (idx) => {
    setFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return copy;
    });
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed?.imagekitId) {
        setImagesToRemove((ids) => ids.concat(removed.imagekitId));
      }
      return copy;
    });
  };

  const fileInputRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || budget === "")
      return toast.error("Please fill required fields");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("budget", budget);
    files.forEach((fObj, i) => {
      fd.append("images", fObj.file, fObj.file.name || `image-${i}`);
    });

    if (imagesToRemove.length > 0) {
      fd.append("imagesToRemove", JSON.stringify(imagesToRemove));
    }

    if (gigId) {
      try {
        setUpdating(true);
        const res = await fetch(`${API_BASE_URL}/api/gigs/${gigId}`, {
          method: "PATCH",
          credentials: "include",
          body: fd,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to update gig");
        }

        const data = await res.json();
        toast.success("Gig updated successfully");
        navigate("/my-gigs");
      } catch (err) {
        toast.error(err?.message || "Failed to update gig");
      } finally {
        setUpdating(false);
      }

      return;
    }

    const tempId = `temp-${Date.now()}`;
    dispatch(
      addLocalGig({
        _id: tempId,
        title,
        description,
        budget: Number(budget),
        images: files.map((f) => ({ url: f.preview, __local: true })),
        status: "open",
        __tempId: tempId,
      })
    );

    try {
      await dispatch(createGig({ formPayload: fd, tempId })).unwrap();
      toast.success("Gig posted successfully");
      navigate("/my-gigs");
    } catch (err) {
      toast.error(err?.message || "Failed to create gig");
    }
  };

  useEffect(() => {
    if (!gigId) return;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/gigs/${gigId}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || 'Failed to load gig');
        }
        const json = await res.json();
        const g = json.gig;
        setTitle(g.title || "");
        setDescription(g.description || "");
        setBudget(g.budget ?? "");
        setExistingImages(Array.isArray(g.images) ? g.images : []);
      } catch (err) {
        toast.error(err?.message || 'Failed to load gig');
      }
    };

    load();
  }, [gigId]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="max-w-3xl mx-auto pt-28 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Post a <span className="text-[#FF4801]">Gig</span>
          </h1>
          <p className="text-zinc-500 mt-2">
            Describe your project and start receiving bids from skilled
            freelancers.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Gig Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a landing page in React"
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 focus:ring-2 focus:ring-[#FF4801]/30 focus:border-[#FF4801] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the scope, expectations, and deliverables…"
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 h-36 resize-none focus:ring-2 focus:ring-[#FF4801]/30 focus:border-[#FF4801] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Budget
            </label>
            <div className="mt-2 flex items-center w-40 rounded-lg border border-zinc-300 px-3 focus-within:ring-2 focus-within:ring-[#FF4801]/30 focus-within:border-[#FF4801]">
              <span className="text-zinc-500">$</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-2 py-3 outline-none"
                min="0"
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Reference Images <span className="text-zinc-400">(max 3)</span>
            </label>

            <label
              className={`mt-3 flex items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer hover:border-[#FF4801] transition border-zinc-300`}
              onClick={(e) => {
                const totalNow = files.length + (existingImages.length || 0);
                if (totalNow >= 3) {
                  e.preventDefault();
                  // don't open file picker; inform user
                  toast.info('Maximum 3 images already added — remove one to add new');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              }}
            >
              <span className="text-zinc-500">
                Click to upload images
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                ref={fileInputRef}
                className="hidden"
              />
            </label>

            {(existingImages.length > 0 || files.length > 0) && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {existingImages.map((img, i) => (
                  <div key={`existing-${i}`} className="relative rounded-lg overflow-hidden border">
                    <img src={img.thumbnail || img.url} alt="preview" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 bg-white/90 text-xs px-2 py-0.5 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {files.map((f, i) => (
                  <div key={`new-${i}`} className="relative rounded-lg overflow-hidden border">
                    <img src={f.preview} alt="preview" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-white/90 text-xs px-2 py-0.5 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              disabled={creating || updating}
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {creating ? (gigId ? "Updating…" : "Posting…") : gigId ? "Update Gig" : "Post Gig"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-zinc-600 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default PostGig;
