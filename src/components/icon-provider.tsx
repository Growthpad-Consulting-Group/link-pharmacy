"use client";

// Importing the icon set registers the bundled icons with @iconify/react. This runs during
// server render and on the client before the page hydrates, so icons never wait on a network request.
import "@/lib/icon-set";

export function IconProvider() {
  return null;
}
