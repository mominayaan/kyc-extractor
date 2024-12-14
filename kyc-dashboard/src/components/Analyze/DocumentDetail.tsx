import React from "react";

interface DocumentDetailProps {
  document: {
    _id: string;
    file_name: string;
    type: "passport" | "drivers_license";
    status: "pending" | "processing" | "completed" | "failed";
    metadata: any;
    created_at: string;
    seen: boolean;
    view_url: string;
  };
  onClose: () => void;
  onRetry: () => void;
  onMarkSeen: () => void;
}

export const DocumentDetail: React.FC<DocumentDetailProps> = ({
  document,
  onClose,
  onRetry,
  onMarkSeen,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="w-1/2 bg-white h-full overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{document.file_name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div className="mb-6">
            <img
              src={document.view_url}
              alt={document.file_name}
              className="w-full rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry Processing
            </button>
            <button
              onClick={onMarkSeen}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Mark as Seen
            </button>
          </div>

          {/* Metadata */}
          {document.metadata && document.status === "completed" && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Extracted Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(document.metadata)
                  .filter(([key]) => !key.includes("confidence"))
                  .map(([key, value]) => {
                    const confidenceKey = `${key}_confidence`;
                    const confidence = document.metadata[confidenceKey];
                    
                    const confidenceColor = {
                      high: "bg-green-500",
                      medium: "bg-yellow-500",
                      low: "bg-orange-500",
                      unreadable: "bg-red-500"
                    }[confidence as 'high' | 'medium' | 'low' | 'unreadable'] || "bg-gray-500";

                    return (
                      <div key={key} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-gray-700">
                            {key.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${confidenceColor}`}>
                            {confidence}
                          </span>
                        </div>
                        <p className="text-gray-600">{value as string}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
