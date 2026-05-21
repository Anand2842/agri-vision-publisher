import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


interface ImageUploadEditorProps {
  label: string;
  page: string;
  section: string;
  contentKey: string;
  initialValue: string;
  onUploadSuccess?: (url: string) => void;
}

export function ImageUploadEditor({
  label,
  page,
  section,
  contentKey,
  initialValue,
  onUploadSuccess,
}: ImageUploadEditorProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialValue || "");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const sanitizedKey = contentKey.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = `${page}/${section}/${sanitizedKey}-${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage bucket 'site-assets'
      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from("site-assets").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update site_content table
      const { error: dbError } = await supabase.from("site_content").upsert(
        {
          page,
          section,
          key: contentKey,
          value: publicUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "page,section,key" }
      );

      if (dbError) {
        throw dbError;
      }

      setImageUrl(publicUrl);
      toast.success("Image uploaded and saved successfully!");
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);

      // Extract filePath from public URL if possible to clean up storage
      if (imageUrl && imageUrl.includes("site-assets/")) {
        const filePath = imageUrl.split("site-assets/").pop()?.split("?")[0];
        if (filePath) {
          await supabase.storage.from("site-assets").remove([filePath]);
        }
      }

      // Set value to empty in site_content table
      const { error: dbError } = await supabase.from("site_content").upsert(
        {
          page,
          section,
          key: contentKey,
          value: "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "page,section,key" }
      );

      if (dbError) {
        throw dbError;
      }

      setImageUrl("");
      toast.success("Image removed successfully!");
      if (onUploadSuccess) {
        onUploadSuccess("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
      <Label className="block text-sm font-medium mb-1">{label}</Label>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {imageUrl ? (
          <div className="relative aspect-video w-full sm:w-48 bg-muted rounded-md overflow-hidden border flex items-center justify-center group">
            <img
              src={imageUrl}
              alt={label}
              className="object-cover w-full h-full"
              onError={(e) => {
                // Handle fallback if image doesn't load
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><path d='M21 15l-5-5L5 21'/></svg>";
              }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video w-full sm:w-48 bg-muted rounded-md flex flex-col items-center justify-center border border-dashed text-muted-foreground p-4">
            <ImageIcon className="h-8 w-8 mb-2 stroke-[1.5]" />
            <span className="text-xs text-center">No image selected</span>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {imageUrl ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Button variant="outline" size="sm" disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Button variant="outline" size="sm" disabled={uploading} className="w-full">
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Image
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP, SVG or GIF. Max 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
