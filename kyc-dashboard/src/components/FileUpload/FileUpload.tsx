import { UploadButton } from "./UploadButton";
import { FilePreview } from "./FilePreview";
import { useFileUpload } from "./useFileUpload";

export const FileUpload: React.FC = () => {
  const {
    files,
    isDragging,
    handleFileChange,
    handleDrag,
    handleDragIn,
    handleDragOut,
    handleDrop,
    removeFile,
  } = useFileUpload();

  const sortedFiles = [...files].sort((a, b) => {
    const statusOrder = {
      uploading: 0,
      pending: 1,
      error: 2,
      completed: 3,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div className="p-8">
      <div className="flex justify-center mb-8">
        <UploadButton
          isDragging={isDragging}
          onDragIn={handleDragIn}
          onDragOut={handleDragOut}
          onDrag={handleDrag}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
        />
      </div>

      <div className="grid grid-cols-6 gap-4 max-h-[500px] overflow-y-scroll">
        {sortedFiles.map((fileState, index) => (
          <FilePreview
            key={index}
            file={fileState.file}
            status={fileState.status}
            url={fileState.url}
            onRemove={() => removeFile(index)}
          />
        ))}
      </div>
    </div>
  );
};
