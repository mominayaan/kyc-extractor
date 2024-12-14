import { createFileRoute } from "@tanstack/react-router";
import { DocumentsContainer } from "../components/Analyze/DocumentsContainer";

export const Route = createFileRoute("/analyze")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Document Analysis
          </h1>
          <DocumentsContainer />
        </div>
      </div>
    </div>
  );
}
