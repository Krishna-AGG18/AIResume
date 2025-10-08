import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [deletingFiles, setDeletingFiles] = useState<string[]>([]); // track files being deleted

  const loadFiles = async () => {
    const files = (await fs.readDir("./")) as FSItem[];
    setFiles(files);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  // Delete a single file
  const handleDeleteFile = async (filePath: string) => {
    if (!confirm(`Are you sure you want to delete ${filePath}?`)) return;
    setDeletingFiles((prev) => [...prev, filePath]);
    try {
      await fs.delete(filePath);
      await loadFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
    } finally {
      setDeletingFiles((prev) => prev.filter((f) => f !== filePath));
    }
  };

  // Delete all files
  const handleDeleteAll = async () => {
    if (!confirm("Are you sure you want to wipe all app data?")) return;
    setDeletingFiles(files.map((f) => f.path));
    try {
      for (const file of files) {
        await fs.delete(file.path);
      }
      await kv.flush();
      await loadFiles();
    } catch (err) {
      console.error("Error wiping files:", err);
    } finally {
      setDeletingFiles([]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center text-gradient">
        Wipe App Data
      </h1>

      <p className="text-center mb-6 text-gray-700">
        Authenticated as: <span className="font-medium">{auth.user?.username}</span>
      </p>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Existing Files:</h2>
        {files.length === 0 ? (
          <p className="text-gray-400">No files found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50"
              >
                <p className="text-gray-800">{file.name}</p>
                <button
                  className={`text-red-500 hover:text-red-700 font-semibold px-3 py-1 rounded-md transition ${
                    deletingFiles.includes(file.path) ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={deletingFiles.includes(file.path)}
                  onClick={() => handleDeleteFile(file.path)}
                >
                  {deletingFiles.includes(file.path) ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="text-center">
          <button
            className={`bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition ${
              deletingFiles.length > 0 ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={handleDeleteAll}
            disabled={deletingFiles.length > 0}
          >
            {deletingFiles.length > 0 ? "Deleting..." : "Wipe All Data"}
          </button>
        </div>
      )}
    </div>
  );
};

export default WipeApp;
