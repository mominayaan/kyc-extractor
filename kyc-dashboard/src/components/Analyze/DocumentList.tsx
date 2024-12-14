import React from "react";
import { DocumentCard } from "./DocumentCard";
import { Pagination } from "./Pagination";
import { DocumentDetail } from "./DocumentDetail";

interface Document {
  _id: string;
  file_name: string;
  type: "passport" | "drivers_license";
  status: "pending" | "processing" | "completed" | "failed";
  metadata: any;
  created_at: string;
  seen: boolean;
  view_url: string;
}

interface DocumentListProps {
  documents: Document[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDocumentRemoved: (documentId: string) => void;
  onDocumentUpdated: () => void;
  onOpenDocument: (document: Document) => void;
  currentViewedDocument: Document | null;
  onCloseDocument: () => void;
  onRetry: () => void;
  onMarkSeen: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  currentPage,
  totalPages,
  onPageChange,
  onDocumentRemoved,
  onDocumentUpdated,
  onOpenDocument,
  currentViewedDocument,
  onCloseDocument,
  onRetry,
  onMarkSeen,
}) => {
  return (
    <div className="p-8">
      <div className="grid grid-cols-3 gap-6 mb-6">
        {documents.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
            onDocumentRemoved={onDocumentRemoved}
            onDocumentUpdated={onDocumentUpdated}
            onOpenDocument={onOpenDocument}
          />
        ))}
      </div>

      {currentViewedDocument && (
        <DocumentDetail
          document={currentViewedDocument}
          onClose={onCloseDocument}
          onRetry={onRetry}
          onMarkSeen={onMarkSeen}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};
