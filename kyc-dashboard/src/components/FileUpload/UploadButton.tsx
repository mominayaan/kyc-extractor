import React from "react";

interface UploadButtonProps {
  isDragging: boolean;
  onDragIn: (e: React.DragEvent) => void;
  onDragOut: (e: React.DragEvent) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  isDragging,
  onDragIn,
  onDragOut,
  onDrag,
  onDrop,
  onFileChange,
}) => {
  return (
    <label
      htmlFor="file-upload"
      className={`flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
      }`}
      onDragEnter={onDragIn}
      onDragLeave={onDragOut}
      onDragOver={onDrag}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <svg
          className={`w-8 h-8 mb-4 ${isDragging ? "text-blue-500" : "text-gray-500"}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 16"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
          />
        </svg>
        <p
          className={`mb-2 text-sm ${isDragging ? "text-blue-500" : "text-gray-500"}`}
        >
          <span className="font-semibold">Click to upload</span> or drag and
          drop
        </p>
        <p
          className={`text-xs ${isDragging ? "text-blue-500" : "text-gray-500"}`}
        >
          Document photos
        </p>
      </div>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        multiple
        accept="image/*"
        onChange={onFileChange}
      />
    </label>
  );
};
