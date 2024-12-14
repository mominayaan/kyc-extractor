import React, { useEffect, useState } from "react";
import { DocumentList } from "./DocumentList";

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

interface DocumentsResponse {
  data: Document[];
  pagination: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}

export const DocumentsContainer: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [currentViewedDocument, setCurrentViewedDocument] = useState<Document | null>(null);

  const fetchDocuments = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/extraction/documents?page=${page}&per_page=9`,
      );
      const data: DocumentsResponse = await response.json();
      
      // Update the currently viewed document if it exists
      if (currentViewedDocument) {
        const updatedCurrentDocument = data.data.find(
          (doc) => doc._id === currentViewedDocument._id
        );
        if (updatedCurrentDocument) {
          setCurrentViewedDocument(updatedCurrentDocument);
        }
      }
      
      setDocuments(data.data);
      setTotalPages(data.pagination.total_pages);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = (document: Document) => {
    setCurrentViewedDocument(document);
  };
  
  const handleCloseDocument = () => {
    setCurrentViewedDocument(null);
  };

  useEffect(() => {
    // Initial fetch
    fetchDocuments(currentPage);

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchDocuments(currentPage);
    }, 10000); // 10 seconds

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, [currentPage]); // Re-run effect when page changes

  const handleDocumentRemoved = (documentId: string) => {
    setDocuments((prevDocuments) =>
      prevDocuments.filter((doc) => doc._id !== documentId),
    );

    // If this was the last document on the page, go to previous page
    if (documents.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
    // If not the last page, refresh current page to get new documents
    else if (documents.length === 1) {
      fetchDocuments(currentPage);
    }
  };

  const handleDocumentUpdated = () => {
    // Refresh the current page
    fetchDocuments(currentPage);
  };

  const handleRetry = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/extraction/documents/${currentViewedDocument?._id}/retry`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        fetchDocuments(currentPage);
      }
    } catch (error) {
      console.error("Error retrying document:", error);
    }
  };

  const handleMarkSeen = async () => {
    if (!currentViewedDocument) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/extraction/documents/${currentViewedDocument._id}/mark-seen`,
        {
          method: "PUT",
        }
      );
      if (response.ok) {
        handleDocumentRemoved(currentViewedDocument._id);
        handleCloseDocument();
      }
    } catch (error) {
      console.error("Error marking document as seen:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <DocumentList
      documents={documents}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      onDocumentRemoved={handleDocumentRemoved}
      onDocumentUpdated={handleDocumentUpdated}
      onOpenDocument={handleOpenDocument}
      currentViewedDocument={currentViewedDocument}
      onCloseDocument={handleCloseDocument}
      onRetry={handleRetry}
      onMarkSeen={handleMarkSeen}
    />
  );
};
