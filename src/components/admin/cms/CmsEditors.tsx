import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { updateSiteContentCache } from "@/hooks/useSiteContent";

export function CmsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export function CmsSaveButton({
  page,
  section,
  contentKey,
  value,
  originalValue,
}: {
  page: string;
  section: string;
  contentKey: string;
  value: string;
  originalValue: string;
}) {
  const [saving, setSaving] = useState(false);
  const hasChanged = value !== originalValue;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_content").upsert(
      {
        page,
        section,
        key: contentKey,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page,section,key" },
    );

    setSaving(false);
    if (error) {
      toast.error(`Failed to save ${contentKey}: ${error.message}`);
    } else {
      updateSiteContentCache(page, section, contentKey, value);
      toast.success(`Saved ${contentKey}`);
    }
  };

  return (
    <Button size="sm" onClick={handleSave} disabled={!hasChanged || saving}>
      {saving ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Save className="h-4 w-4 mr-2" />
      )}
      Save
    </Button>
  );
}

export function TextFieldEditor({
  label,
  page,
  section,
  contentKey,
  initialValue,
}: {
  label: string;
  page: string;
  section: string;
  contentKey: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <CmsSaveButton
          page={page}
          section={section}
          contentKey={contentKey}
          value={value}
          originalValue={initialValue}
        />
      </div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
}

export function TextareaEditor({
  label,
  page,
  section,
  contentKey,
  initialValue,
}: {
  label: string;
  page: string;
  section: string;
  contentKey: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <CmsSaveButton
          page={page}
          section={section}
          contentKey={contentKey}
          value={value}
          originalValue={initialValue}
        />
      </div>
      <Textarea rows={5} value={value} onChange={(e) => setValue(e.target.value)} />
    </div>
  );
}

export function JsonArrayEditor({
  label,
  page,
  section,
  contentKey,
  initialValue,
}: {
  label: string;
  page: string;
  section: string;
  contentKey: string;
  initialValue: string;
}) {
  const [items, setItems] = useState<string[]>(() => {
    try {
      return JSON.parse(initialValue) || [];
    } catch {
      return [];
    }
  });

  const valueStr = JSON.stringify(items);

  const addItem = () => setItems([...items, ""]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
  };

  return (
    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <CmsSaveButton
          page={page}
          section={section}
          contentKey={contentKey}
          value={valueStr}
          originalValue={initialValue}
        />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Input value={item} onChange={(e) => updateItem(i, e.target.value)} />
            <Button variant="outline" size="icon" onClick={() => removeItem(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>
    </div>
  );
}

function InlineImageUploader({
  value,
  onChange,
  page,
  section,
  contentKey,
  fieldKey,
  index,
}: {
  value: string;
  onChange: (val: string) => void;
  page: string;
  section: string;
  contentKey: string;
  fieldKey: string;
  index: number;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const sanitizedKey = contentKey.replace(/[^a-zA-Z0-9]/g, "_");
      const filePath = `${page}/${section}/${sanitizedKey}_${index}_${fieldKey}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("site-assets").getPublicUrl(filePath);
      onChange(data.publicUrl);
      toast.success("Image uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setUploading(true);
      if (value && value.includes("site-assets/")) {
        const filePath = value.split("site-assets/").pop()?.split("?")[0];
        if (filePath) {
          await supabase.storage.from("site-assets").remove([filePath]);
        }
      }
      onChange("");
      toast.success("Image removed!");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 border p-2 rounded bg-muted/10">
      {value ? (
        <div className="relative h-14 w-20 bg-muted rounded overflow-hidden border flex items-center justify-center">
          <img src={value} className="object-cover w-full h-full" alt="Preview" />
          {uploading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-14 w-20 bg-muted rounded flex flex-col items-center justify-center border border-dashed text-muted-foreground p-1 text-center">
          <ImageIcon className="h-5 w-5 stroke-[1.5] mb-0.5 text-muted-foreground/60" />
          <span className="text-xs leading-none">No image</span>
        </div>
      )}
      <div className="flex flex-col space-y-1">
        {value ? (
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="h-7 text-xs text-destructive hover:bg-destructive/10"
            >
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                className="h-7 text-xs"
              >
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              className="h-7 text-xs"
            >
              {uploading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Upload className="h-3 w-3 mr-1" />
              )}
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function JsonObjectArrayEditor({
  label,
  page,
  section,
  contentKey,
  initialValue,
  fields,
}: {
  label: string;
  page: string;
  section: string;
  contentKey: string;
  initialValue: string;
  fields: {
    key: string;
    label: string;
    type?: "text" | "textarea" | "number" | "boolean" | "array" | "image";
  }[];
}) {
  const [items, setItems] = useState<any[]>(() => {
    try {
      return JSON.parse(initialValue) || [];
    } catch {
      return [];
    }
  });

  const valueStr = JSON.stringify(items);

  const addItem = () => {
    const newItem: any = {};
    fields.forEach(
      (f) => (newItem[f.key] = f.type === "array" ? [] : f.type === "boolean" ? false : ""),
    );
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, key: string, val: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: val };
    setItems(newItems);
  };

  return (
    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-lg font-semibold">{label}</Label>
        <CmsSaveButton
          page={page}
          section={section}
          contentKey={contentKey}
          value={valueStr}
          originalValue={initialValue}
        />
      </div>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="space-y-3 p-4 border bg-background rounded-md relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => removeItem(i)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={item[field.key] || ""}
                    onChange={(e) => updateItem(i, field.key, e.target.value)}
                  />
                ) : field.type === "array" ? (
                  <Input
                    value={Array.isArray(item[field.key]) ? item[field.key].join(", ") : ""}
                    onChange={(e) =>
                      updateItem(
                        i,
                        field.key,
                        e.target.value.split(",").map((s) => s.trim()),
                      )
                    }
                    placeholder="Comma separated values"
                  />
                ) : field.type === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={!!item[field.key]}
                    onChange={(e) => updateItem(i, field.key, e.target.checked)}
                    className="ml-2"
                  />
                ) : field.type === "image" ? (
                  <InlineImageUploader
                    value={item[field.key] || ""}
                    onChange={(val) => updateItem(i, field.key, val)}
                    page={page}
                    section={section}
                    contentKey={contentKey}
                    fieldKey={field.key}
                    index={i}
                  />
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : "text"}
                    value={item[field.key] || ""}
                    onChange={(e) =>
                      updateItem(
                        i,
                        field.key,
                        field.type === "number" ? Number(e.target.value) : e.target.value,
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addItem} className="mt-4">
        <Plus className="h-4 w-4 mr-2" /> Add Object
      </Button>
    </div>
  );
}

export function KeyValueTableEditor({
  label,
  page,
  section,
  contentKey,
  initialValue,
}: {
  label: string;
  page: string;
  section: string;
  contentKey: string;
  initialValue: string;
}) {
  const [items, setItems] = useState<[string, string][]>(() => {
    try {
      return JSON.parse(initialValue) || [];
    } catch {
      return [];
    }
  });

  const valueStr = JSON.stringify(items);

  const addItem = () => setItems([...items, ["", ""]]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, val: [string, string]) => {
    const newItems = [...items];
    newItems[index] = val;
    setItems(newItems);
  };

  return (
    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <CmsSaveButton
          page={page}
          section={section}
          contentKey={contentKey}
          value={valueStr}
          originalValue={initialValue}
        />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Input
              placeholder="Key"
              value={item[0]}
              onChange={(e) => updateItem(i, [e.target.value, item[1]])}
              className="w-1/3"
            />
            <Input
              placeholder="Value"
              value={item[1]}
              onChange={(e) => updateItem(i, [item[0], e.target.value])}
              className="w-2/3"
            />
            <Button variant="outline" size="icon" onClick={() => removeItem(i)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4 mr-2" /> Add Row
      </Button>
    </div>
  );
}
