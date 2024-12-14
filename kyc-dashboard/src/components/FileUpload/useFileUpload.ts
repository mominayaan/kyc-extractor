import { useState } from "react";

export interface FileUploadState {
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  url?: string;
}

export const useFileUpload = () => {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      // Set initial uploading state
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file ? { ...f, status: "uploading" } : f,
        ),
      );

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.file === file
                ? { ...f, status: "completed", url: response.url }
                : f,
            ),
          );
          resolve(response);
        } else {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.file === file ? { ...f, status: "error" } : f,
            ),
          );
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === file ? { ...f, status: "error" } : f,
          ),
        );
        reject(new Error("Upload failed"));
      });

      xhr.open(
        "POST",
        `${import.meta.env.VITE_BACKEND_URL}/api/ingest/upload`,
        true,
      );
      xhr.send(formData);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        status: "pending" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Automatically start uploading each file
      newFiles.forEach(({ file }) => uploadFile(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((file) => ({
        file,
        status: "pending" as const,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Automatically start uploading each file
      newFiles.forEach(({ file }) => uploadFile(file));
      e.dataTransfer.clearData();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  return {
    files,
    isDragging,
    handleFileChange,
    handleDrag,
    handleDragIn,
    handleDragOut,
    handleDrop,
    removeFile,
  };
};
