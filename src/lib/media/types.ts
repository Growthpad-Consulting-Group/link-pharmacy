// Client-safe media types. Shared by the upload API and the admin media picker.
export type MediaItem = {
  id: string;
  url: string;
  originalName: string;
  contentType: string;
  size: number;
  createdAt: string;
};
