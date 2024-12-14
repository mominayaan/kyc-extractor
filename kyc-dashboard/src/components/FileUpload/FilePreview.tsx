interface FilePreviewProps {
  file: File;
  status: "pending" | "uploading" | "completed" | "error";
  onRemove: () => void;
  url?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  status,
  onRemove,
  url,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg shadow-sm">
      <div className="p-4">
        {/* Image Preview */}
        <div className="relative aspect-video mb-3 bg-gray-100 rounded-lg overflow-hidden">
          {file.type.startsWith("image/") ? (
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="w-full h-full object-cover"
              onLoad={(e) =>
                URL.revokeObjectURL((e.target as HTMLImageElement).src)
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No preview
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-sm font-medium truncate max-w-[180px]"
            title={file.name}
          >
            {file.name}
          </span>
          <button
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500 mb-2 flex justify-between">
          <span>{(file.size / 1024).toFixed(2)} KB</span>
          <span
            className={
              status === "completed"
                ? "text-green-500"
                : status === "error"
                  ? "text-red-500"
                  : "text-blue-500"
            }
          >
            {status === "completed"
              ? "Uploaded"
              : status === "error"
                ? "Failed"
                : status === "uploading"
                  ? "Uploading..."
                  : "Pending"}
          </span>
        </div>
      </div>
    </div>
  );
};
