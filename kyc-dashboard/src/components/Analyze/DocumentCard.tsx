import React, { useState } from "react";
import { format } from "date-fns";
import { DocumentDetail } from "./DocumentDetail";

interface DocumentCardProps {
  document: Document;
  onDocumentRemoved?: (documentId: string) => void;
  onDocumentUpdated?: () => void;
  onOpenDocument: (document: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onDocumentRemoved,
  onDocumentUpdated,
  onOpenDocument,
}) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleRetry = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/extraction/documents/${document._id}/retry`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        // Call the callback to refresh the documents list
        onDocumentUpdated?.();
      } else {
        throw new Error("Failed to retry document processing");
      }
    } catch (error) {
      console.error("Error retrying document:", error);
      // You might want to show an error toast/notification here
    }
  };

  const handleMarkSeen = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/extraction/documents/${document._id}/mark-seen`,
        {
          method: "PUT",
        },
      );
      if (response.ok) {
        // Call the onDocumentRemoved prop to remove the document from the list
        onDocumentRemoved?.(document._id);
      }
    } catch (error) {
      console.error("Error marking document as seen:", error);
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onOpenDocument(document)}
      >
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1">
            {document.file_name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {format(new Date(document.created_at), "MMM d, yyyy HH:mm")}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 capitalize">
              {document.type ? document.type.replace("_", " ") : "Unknown Type"}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                document.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : document.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : document.status === "processing"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {document.status || "unknown"}
            </span>
          </div>
        </div>
      </div>

      {showDetail && (
        <DocumentDetail
          document={document}
          onClose={() => setShowDetail(false)}
          onRetry={handleRetry}
          onMarkSeen={handleMarkSeen}
        />
      )}
    </>
  );
};
