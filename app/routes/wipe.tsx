import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [deleting, setDeleting] = useState(false);

  const loadFiles = async () => {
    try {
      const res = (await fs.readDir("./")) as FSItem[];
      setFiles(res);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ Are you sure you want to delete ALL files?")) return;

    setDeleting(true);
    try {
      for (const file of files) {
        await fs.delete(file.path);
      }
      await kv.flush();
      await loadFiles();
    } catch (err) {
      console.error("Error deleting all:", err);
    }
    setDeleting(false);
  };

  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const handleDeleteOne = async (path: string) => {
    if (!confirm("Delete this file?")) return;

    setDeletingFile(path);
    try {
      await fs.delete(path);
      await kv.delete(path);
      setFiles((prev) => prev.filter((file) => file.path !== path));
      await loadFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
      alert("Failed to delete the file.");
    }
    setDeletingFile(null);
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 text-gray-800 py-10 px-6">
      <Navbar />
      <div className="max-w-2xl w-full bg-white shadow-md rounded-2xl p-6 border border-gray-100 mt-4">
        <h1 className="text-2xl font-bold mb-2 text-center">File Manager</h1>
        <p className="text-center text-gray-600 mb-6">
          Authenticated as{" "}
          <span className="font-semibold">{auth.user?.username}</span>
        </p>

        {files.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No files found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center bg-gray-100 rounded-xl p-3 hover:bg-gray-200 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-medium">{file.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteOne(file.path)}
                  disabled={deletingFile === file.path}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-sm rounded-md transition"
                >
                  {deletingFile === file.path ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={handleDeleteAll}
            disabled={deleting || files.length === 0}
            className={`px-5 py-2 rounded-md font-medium transition ${
              deleting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 text-white shadow"
            }`}
          >
            {deleting ? "Deleting..." : "Wipe All App Data"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WipeApp;
