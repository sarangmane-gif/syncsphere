import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UploadCloud, Download, ExternalLink, Eye, Trash2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";
import { getDocuments, uploadDocument, deleteDocument } from "@/lib/api";
import { PageHeader, Panel, Pill, Empty, MagneticButton } from "@/components/ui-kit/Primitives";

const ACCEPTED_FILE_TYPES = ["*/*"];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function Documents() {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("syncsphere-token");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [uploadCategory, setUploadCategory] = useState("General");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["documents", searchQuery, categoryFilter],
    queryFn: () =>
      getDocuments(token, {
        search: searchQuery,
        category: categoryFilter === "All" ? "" : categoryFilter,
      }),
    enabled: !!token,
    keepPreviousData: true,
  });

  const categories = useMemo(() => {
    if (!data?.categories?.length) {
      return ["All", "General"];
    }
    return ["All", ...data.categories.filter((category) => category !== "All")];
  }, [data]);

  const uploadMutation = useMutation({
    mutationFn: (formData) => uploadDocument(token, formData),
    onSuccess: () => {
      toast.success("Document uploaded successfully.");
      setSelectedFile(null);
      setUploadCategory("General");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => {
      const message = error?.response?.data?.error || error?.message || "Upload failed.";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId) => deleteDocument(token, documentId),
    onSuccess: () => {
      toast.success("Document deleted.");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setPreviewDocument(null);
    },
    onError: (error) => {
      const message = error?.response?.data?.error || error?.message || "Unable to delete document.";
      toast.error(message);
    },
  });

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleUploadSubmit = (event) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("category", uploadCategory);
    uploadMutation.mutate(formData);
  };

  const documents = data?.documents || [];
  const previewUrl = previewDocument ? `${previewDocument.download_url}?token=${token}&preview=1` : "";

  return (
    <div data-testid="documents-page" className="space-y-8">
      <PageHeader
        overline="Document repository"
        title="Documents"
        description={
          t.documentsDescription ||
          "Upload, browse and preview internal documents with category filters, secure downloads and quick search."
        }
      />

      <Panel className="p-6" testid="documents-upload-panel">
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="overline mb-2 block">Upload file</label>
                <div className="rounded-3xl border border-dashed hairline bg-[hsl(var(--surface)/0.55)] p-5">
                  <div className="flex flex-col gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border hairline bg-[hsl(var(--surface)/0.65)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-foreground transition hover:border-primary hover:text-primary">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Choose file
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                      />
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : "PDF, Word, Excel, PowerPoint, text, image or ZIP files (max 25 MB)."}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="overline mb-2 block">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(event) => setUploadCategory(event.target.value)}
                  className="w-full rounded-3xl border hairline bg-[hsl(var(--surface)/0.55)] p-4 text-sm outline-none transition focus:border-primary"
                  data-testid="document-category-select"
                >
                  {categories
                    .filter((cat) => cat !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton type="submit" variant="primary" testid="upload-document-btn">
                Upload document
              </MagneticButton>
              {uploadMutation.isLoading && <span className="text-sm text-muted-foreground">Uploading…</span>}
              {uploadMutation.isError && (
                <span className="text-sm text-red-400">Upload failed. Try a different file.</span>
              )}
            </div>
          </form>

          <div className="rounded-3xl border hairline bg-[hsl(var(--surface)/0.55)] p-6">
            <p className="overline text-[hsl(var(--gold))]">Repository rules</p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>Keep files organized by category and avoid duplicate uploads.</p>
              <p>Search by file name, uploader or category.</p>
              <p>Preview PDFs and images directly before download.</p>
              <p>Only files you uploaded may be deleted from the repository.</p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-6" testid="documents-filter-panel">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl flex-1">
            <label className="sr-only" htmlFor="documents-search">
              Search documents
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="documents-search"
                type="search"
                placeholder={t.searchPlaceholder || "Search documents, authors or categories…"}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full rounded-full border hairline bg-[hsl(var(--surface)/0.55)] py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            <MagneticButton
              type="button"
              variant="ghost"
              className="min-w-[10rem]"
              onClick={() => setSearchQuery(searchInput.trim())}
              testid="documents-search-btn"
            >
              Search
            </MagneticButton>
            <MagneticButton
              type="button"
              variant="ghost"
              className="min-w-[10rem]"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setCategoryFilter("All");
              }}
              testid="documents-clear-btn"
            >
              Clear filters
            </MagneticButton>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((option) => (
            <Pill
              key={option}
              active={categoryFilter === option}
              onClick={() => setCategoryFilter(option)}
              testid={`documents-category-${option.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {option}
            </Pill>
          ))}
        </div>
      </Panel>

      <Panel className="p-6" testid="documents-list-panel">
        {isLoading && <Empty>Loading documents…</Empty>}
        {!isLoading && !documents.length && <Empty>No documents match your search.</Empty>}

        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-3xl border hairline bg-[hsl(var(--surface)/0.55)] p-5"
              data-testid={`document-card-${doc.id}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] gold-text">
                      <FileText className="mr-2 h-3.5 w-3.5" />
                      {doc.file_type.toUpperCase()}
                    </span>
                    <Pill tone="blue">{doc.category}</Pill>
                  </div>

                  <h3 className="mt-4 font-display text-xl font-semibold text-foreground truncate">
                    {doc.original_filename}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Uploaded by {doc.uploaded_by_name} • {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <MagneticButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      const url = `${BACKEND_URL}${doc.download_url}?token=${token}${doc.previewable ? "&preview=1" : ""}`;
                      window.open(url, "_blank");
                    }}
                    testid={`document-open-${doc.id}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </MagneticButton>
                  {doc.previewable && (
                    <MagneticButton
                      type="button"
                      variant="ghost"
                      onClick={() => setPreviewDocument(doc)}
                      testid={`document-preview-${doc.id}`}
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </MagneticButton>
                  )}
                  {doc.can_delete && (
                    <MagneticButton
                      type="button"
                      variant="gold"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      testid={`document-delete-${doc.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </MagneticButton>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="absolute inset-0" onClick={() => setPreviewDocument(null)} />
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border hairline bg-surface">
            <div className="flex items-center justify-between border-b hairline px-5 py-4">
              <div>
                <p className="overline text-[hsl(var(--gold))]">Preview</p>
                <h2 className="mt-1 font-display text-xl font-semibold">{previewDocument.original_filename}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="rounded-full border hairline p-2 text-muted-foreground transition hover:border-[hsl(var(--gold)/0.35)] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-[60vh] bg-[#111] p-4">
              {previewDocument.file_type === "pdf" ? (
                <iframe
                  src={previewUrl}
                  title={previewDocument.original_filename}
                  className="h-[60vh] w-full rounded-3xl border border-dashed hairline bg-black"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={previewDocument.original_filename}
                  className="mx-auto h-[60vh] w-full max-w-full rounded-3xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
