import { FileUpload } from "../components/FileUpload/FileUpload";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div>
      <FileUpload />
    </div>
  ),
});
