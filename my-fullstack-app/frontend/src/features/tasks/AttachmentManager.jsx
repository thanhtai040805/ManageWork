import { useState, useEffect, useRef } from "react";
import { Paperclip, X, Loader2, Download, Trash2, FileText, Image as ImageIcon, File, Plus } from "lucide-react";
import axios from "axios";
import { notificationService } from "../../services/notification.service";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/v1/api";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8888";

export const AttachmentManager = ({ taskId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, [taskId]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API_URL}/files/task/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setFiles(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId);

    try {
      const res = await axios.post(`${API_URL}/files/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data"
        },
      });
      setFiles([res?.data?.data, ...files]);
    } catch (error) {
      console.error("Failed to upload file", error);
      notificationService.error("Upload failed. Max size 10MB.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`${API_URL}/files/${fileId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setFiles(files.filter(f => f.file_id !== fileId));
    } catch (error) {
      console.error("Failed to delete file", error);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <ImageIcon size={20} className="text-blue-500" />;
    if (type.includes("pdf")) return <FileText size={20} className="text-rose-500" />;
    return <File size={20} className="text-slate-500" />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(1)} KB`;
  };

  if (loading) return <Loader2 className="animate-spin text-slate-400" size={16} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip size={18} className="text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Attachments ({files.length})
          </h3>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
        >
          {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          Upload
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {files.map(file => (
          <div 
            key={file.file_id}
            className="group relative flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
              {getFileIcon(file.file_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate" title={file.file_url.split('/').pop()}>
                {file.file_url.split('/').pop()}
              </p>
              <p className="text-xs text-slate-400">
                {file.uploader_name} • {new Date(file.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={`${BASE_URL}${file.file_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                download
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              >
                <Download size={16} />
              </a>
              <button 
                onClick={() => handleDelete(file.file_id)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {files.length === 0 && !isUploading && (
          <div className="col-span-full py-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <p className="text-sm text-slate-400">No attachments yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
