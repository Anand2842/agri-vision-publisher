import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlobalSiteContent, useSiteContent } from "@/hooks/useSiteContent";
import { Loader2 } from "lucide-react";
import {
  CmsSection,
  TextFieldEditor,
  TextareaEditor,
  JsonArrayEditor,
  JsonObjectArrayEditor,
  KeyValueTableEditor,
} from "@/components/admin/cms/CmsEditors";
import { ImageUploadEditor } from "@/components/admin/cms/ImageUploadEditor";
import { SiteContentKeys } from "@/lib/site-content-defaults";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: AdminContentPage,
});

function AdminContentPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Site Content Management</h1>
      <Tabs defaultValue="home" className="w-full">
        <TabsList className="mb-8 flex-wrap h-auto">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="editorial_board">Editorial Board</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          <TabsTrigger value="startup_spotlight">Startup Spotlight</TabsTrigger>
          <TabsTrigger value="archives">Archives</TabsTrigger>
          <TabsTrigger value="search_page">Search Page</TabsTrigger>
          <TabsTrigger value="current_issue">Current Issue</TabsTrigger>
          <TabsTrigger value="seo">SEO Meta</TabsTrigger>
        </TabsList>

        <TabsContent value="header">
          <HeaderCms />
        </TabsContent>
        <TabsContent value="footer">
          <FooterCms />
        </TabsContent>
        <TabsContent value="home">
          <HomeCms />
        </TabsContent>
        <TabsContent value="about">
          <AboutCms />
        </TabsContent>
        <TabsContent value="contact">
          <ContactCms />
        </TabsContent>
        <TabsContent value="editorial_board">
          <EditorialBoardCms />
        </TabsContent>
        <TabsContent value="membership">
          <MembershipCms />
        </TabsContent>
        <TabsContent value="guidelines">
          <GuidelinesCms />
        </TabsContent>
        <TabsContent value="startup_spotlight">
          <StartupSpotlightCms />
        </TabsContent>
        <TabsContent value="archives">
          <ArchivesCms />
        </TabsContent>
        <TabsContent value="search_page">
          <SearchPageCms />
        </TabsContent>
        <TabsContent value="current_issue">
          <CurrentIssueCms />
        </TabsContent>
        <TabsContent value="seo">
          <SeoCms />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HeaderCms() {
  const { get, loading } = useSiteContent("header");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Top Bar">
        <TextFieldEditor page="header" section="topbar" contentKey="phone" label="Phone Number" initialValue={get("topbar", "phone")} />
        <TextFieldEditor page="header" section="topbar" contentKey="email" label="Email Address" initialValue={get("topbar", "email")} />
      </CmsSection>
      <CmsSection title="Branding">
        <TextFieldEditor page="header" section="branding" contentKey="title_line1" label="Site Name Line 1" initialValue={get("branding", "title_line1")} />
        <TextFieldEditor page="header" section="branding" contentKey="title_line2" label="Site Name Line 2" initialValue={get("branding", "title_line2")} />
        <TextFieldEditor page="header" section="branding" contentKey="tagline" label="Tagline" initialValue={get("branding", "tagline")} />
        <ImageUploadEditor page="header" section="branding" contentKey="logo_url" label="Site Logo" initialValue={get("branding", "logo_url")} />
      </CmsSection>
      <CmsSection title="Call to Action">
        <TextFieldEditor page="header" section="cta" contentKey="special_issue_label" label="Special Issue Button Label" initialValue={get("cta", "special_issue_label")} />
      </CmsSection>
    </div>
  );
}

function FooterCms() {
  const { get, loading } = useSiteContent("footer");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Branding">
        <TextareaEditor page="footer" section="branding" contentKey="description" label="Footer Description" initialValue={get("branding", "description")} />
        <JsonArrayEditor page="footer" section="branding" contentKey="tagwords" label="Tagwords" initialValue={get("branding", "tagwords")} />
      </CmsSection>
      <CmsSection title="Contact Info">
        <TextFieldEditor page="footer" section="contact" contentKey="name" label="Contact Name" initialValue={get("contact", "name")} />
        <TextFieldEditor page="footer" section="contact" contentKey="address" label="Address" initialValue={get("contact", "address")} />
        <TextFieldEditor page="footer" section="contact" contentKey="phone" label="Phone" initialValue={get("contact", "phone")} />
        <TextFieldEditor page="footer" section="contact" contentKey="email" label="Email" initialValue={get("contact", "email")} />
      </CmsSection>
      <CmsSection title="Legal">
        <TextFieldEditor page="footer" section="legal" contentKey="publisher_name" label="Publisher Name" initialValue={get("legal", "publisher_name")} />
      </CmsSection>
    </div>
  );
}

function HomeCms() {
  const { get, loading } = useSiteContent("home");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero Text">
        <TextFieldEditor page="home" section="hero" contentKey="headline" label="Headline" initialValue={get("hero", "headline")} />
      </CmsSection>
      <CmsSection title="Hero Slide Images">
        <JsonObjectArrayEditor
          page="home"
          section="hero"
          contentKey="slide_images"
          label="Hero Slides"
          initialValue={get("hero", "slide_images")}
          fields={[
            { key: "img", label: "Slide Image", type: "image" },
            { key: "alt", label: "Alt Text", type: "text" },
          ]}
        />
      </CmsSection>
      <CmsSection title="Introduction">
        <TextFieldEditor page="home" section="intro" contentKey="heading" label="Heading" initialValue={get("intro", "heading")} />
        <TextareaEditor page="home" section="intro" contentKey="body" label="Body Text" initialValue={get("intro", "body")} />
      </CmsSection>
      <CmsSection title="Vision & Mission">
        <TextFieldEditor page="home" section="vision_mission" contentKey="heading" label="Heading" initialValue={get("vision_mission", "heading")} />
        <TextareaEditor page="home" section="vision_mission" contentKey="body" label="Body Text" initialValue={get("vision_mission", "body")} />
      </CmsSection>
      <CmsSection title="Testimonials">
        <TextFieldEditor page="home" section="testimonials" contentKey="heading" label="Heading" initialValue={get("testimonials", "heading")} />
        <JsonObjectArrayEditor
          page="home"
          section="testimonials"
          contentKey="items"
          label="Testimonials"
          initialValue={get("testimonials", "items")}
          fields={[
            { key: "quote", label: "Quote", type: "textarea" },
            { key: "name", label: "Name", type: "text" },
            { key: "role", label: "Role", type: "text" },
          ]}
        />
      </CmsSection>
      <CmsSection title="Readership Stats">
        <TextFieldEditor page="home" section="readership" contentKey="heading" label="Heading" initialValue={get("readership", "heading")} />
        <JsonObjectArrayEditor
          page="home"
          section="readership"
          contentKey="items"
          label="Stats"
          initialValue={get("readership", "items")}
          fields={[
            { key: "label", label: "Label", type: "text" },
            { key: "value", label: "Value", type: "number" },
          ]}
        />
      </CmsSection>
      <CmsSection title="Partners">
        <TextFieldEditor page="home" section="partners" contentKey="heading" label="Heading" initialValue={get("partners", "heading")} />
        <JsonObjectArrayEditor
          page="home"
          section="partners"
          contentKey="items"
          label="Partner List"
          initialValue={get("partners", "items")}
          fields={[
            { key: "name", label: "Partner Name", type: "text" },
            { key: "logo_url", label: "Partner Logo", type: "image" },
          ]}
        />
      </CmsSection>
    </div>
  );
}

function AboutCms() {
  const { get, loading } = useSiteContent("about");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero Section">
        <TextFieldEditor page="about" section="hero" contentKey="tagline" label="Tagline" initialValue={get("hero", "tagline")} />
        <TextareaEditor page="about" section="hero" contentKey="para1" label="Paragraph 1" initialValue={get("hero", "para1")} />
        <TextareaEditor page="about" section="hero" contentKey="para2" label="Paragraph 2" initialValue={get("hero", "para2")} />
        <TextareaEditor page="about" section="hero" contentKey="para3" label="Paragraph 3" initialValue={get("hero", "para3")} />
        <TextareaEditor page="about" section="hero" contentKey="para4" label="Paragraph 4" initialValue={get("hero", "para4")} />
      </CmsSection>
      <CmsSection title="Vision">
        <TextFieldEditor page="about" section="vision" contentKey="heading" label="Heading" initialValue={get("vision", "heading")} />
        <TextareaEditor page="about" section="vision" contentKey="body" label="Body" initialValue={get("vision", "body")} />
      </CmsSection>
      <CmsSection title="Mission">
        <TextFieldEditor page="about" section="mission" contentKey="heading" label="Heading" initialValue={get("mission", "heading")} />
        <JsonArrayEditor page="about" section="mission" contentKey="items" label="Mission Points" initialValue={get("mission", "items")} />
      </CmsSection>
      <CmsSection title="Particulars">
        <KeyValueTableEditor page="about" section="particulars" contentKey="items" label="Magazine Particulars" initialValue={get("particulars", "items")} />
      </CmsSection>
    </div>
  );
}

function ContactCms() {
  const { get, loading } = useSiteContent("contact");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Office Info">
        <TextFieldEditor page="contact" section="office" contentKey="chief_editor" label="Chief Editor Name" initialValue={get("office", "chief_editor")} />
        <TextFieldEditor page="contact" section="office" contentKey="chief_editor_title" label="Chief Editor Title" initialValue={get("office", "chief_editor_title")} />
        <TextFieldEditor page="contact" section="office" contentKey="email" label="Email" initialValue={get("office", "email")} />
        <TextFieldEditor page="contact" section="office" contentKey="phone" label="Phone" initialValue={get("office", "phone")} />
        <TextareaEditor page="contact" section="office" contentKey="address" label="Address" initialValue={get("office", "address")} />
        <TextFieldEditor page="contact" section="office" contentKey="hours" label="Hours" initialValue={get("office", "hours")} />
        <TextFieldEditor page="contact" section="office" contentKey="turnaround" label="Turnaround Time" initialValue={get("office", "turnaround")} />
      </CmsSection>
      <CmsSection title="Publisher Info">
        <TextFieldEditor page="contact" section="publisher" contentKey="name" label="Publisher Name" initialValue={get("publisher", "name")} />
        <TextareaEditor page="contact" section="publisher" contentKey="address" label="Publisher Address" initialValue={get("publisher", "address")} />
      </CmsSection>
      <CmsSection title="Advertise Info">
        <TextFieldEditor page="contact" section="advertise" contentKey="heading" label="Heading" initialValue={get("advertise", "heading")} />
        <TextareaEditor page="contact" section="advertise" contentKey="body" label="Body" initialValue={get("advertise", "body")} />
      </CmsSection>
    </div>
  );
}

function EditorialBoardCms() {
  const { get, loading } = useSiteContent("editorial_board");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero">
        <TextFieldEditor page="editorial_board" section="hero" contentKey="tagline" label="Tagline" initialValue={get("hero", "tagline")} />
        <TextareaEditor page="editorial_board" section="hero" contentKey="subtitle" label="Subtitle" initialValue={get("hero", "subtitle")} />
      </CmsSection>
      <CmsSection title="Editors">
        <JsonObjectArrayEditor
          page="editorial_board"
          section="editors"
          contentKey="items"
          label="Editors List"
          initialValue={get("editors", "items")}
          fields={[
            { key: "name", label: "Name", type: "text" },
            { key: "role", label: "Role", type: "text" },
            { key: "title", label: "Title", type: "text" },
            { key: "inst", label: "Institution", type: "text" },
            { key: "country", label: "Country", type: "text" },
            { key: "photo_url", label: "Photo", type: "image" },
          ]}
        />
      </CmsSection>
      <CmsSection title="Advisory Board">
        <JsonObjectArrayEditor
          page="editorial_board"
          section="advisory"
          contentKey="items"
          label="Advisory Board Members"
          initialValue={get("advisory", "items")}
          fields={[
            { key: "name", label: "Name", type: "text" },
            { key: "inst", label: "Institution", type: "text" },
            { key: "country", label: "Country", type: "text" },
            { key: "photo_url", label: "Photo", type: "image" },
          ]}
        />
      </CmsSection>
      <CmsSection title="Reviewers">
        <JsonObjectArrayEditor
          page="editorial_board"
          section="reviewers"
          contentKey="items"
          label="Reviewers"
          initialValue={get("reviewers", "items")}
          fields={[
            { key: "name", label: "Name", type: "text" },
            { key: "inst", label: "Institution", type: "text" },
          ]}
        />
      </CmsSection>
    </div>
  );
}

function MembershipCms() {
  const { get, loading } = useSiteContent("membership");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero">
        <TextFieldEditor page="membership" section="hero" contentKey="heading" label="Heading" initialValue={get("hero", "heading")} />
        <TextareaEditor page="membership" section="hero" contentKey="subtext" label="Subtext" initialValue={get("hero", "subtext")} />
      </CmsSection>
      <CmsSection title="Plans">
        <JsonObjectArrayEditor
          page="membership"
          section="plans"
          contentKey="items"
          label="Membership Plans"
          initialValue={get("plans", "items")}
          fields={[
            { key: "id", label: "ID (internal)", type: "text" },
            { key: "name", label: "Name", type: "text" },
            { key: "price", label: "Price", type: "text" },
            { key: "period", label: "Period", type: "text" },
            { key: "validity", label: "Validity", type: "text" },
            { key: "features", label: "Features (Comma separated)", type: "array" },
            { key: "featured", label: "Featured (Boolean)", type: "boolean" },
          ]}
        />
      </CmsSection>
      <CmsSection title="Payment Details">
        <TextFieldEditor page="membership" section="payment" contentKey="bank_holder" label="Account Holder" initialValue={get("payment", "bank_holder")} />
        <TextFieldEditor page="membership" section="payment" contentKey="bank_account" label="Account Number" initialValue={get("payment", "bank_account")} />
        <TextFieldEditor page="membership" section="payment" contentKey="bank_name" label="Bank Name" initialValue={get("payment", "bank_name")} />
        <TextFieldEditor page="membership" section="payment" contentKey="bank_ifsc" label="IFSC Code" initialValue={get("payment", "bank_ifsc")} />
        <TextFieldEditor page="membership" section="payment" contentKey="bank_branch" label="Branch" initialValue={get("payment", "bank_branch")} />
        <TextFieldEditor page="membership" section="payment" contentKey="upi_number" label="UPI Phone Number" initialValue={get("payment", "upi_number")} />
        <TextFieldEditor page="membership" section="payment" contentKey="contact_email" label="Contact Email" initialValue={get("payment", "contact_email")} />
      </CmsSection>
    </div>
  );
}

function GuidelinesCms() {
  const { get, loading } = useSiteContent("guidelines");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero">
        <TextFieldEditor page="guidelines" section="hero" contentKey="heading" label="Page Heading" initialValue={get("hero", "heading")} />
        <TextareaEditor page="guidelines" section="hero" contentKey="intro" label="Intro Paragraph" initialValue={get("hero", "intro")} />
      </CmsSection>
      <CmsSection title="Process">
        <JsonArrayEditor page="guidelines" section="process" contentKey="steps" label="Process Steps" initialValue={get("process", "steps")} />
        <TextareaEditor page="guidelines" section="process" contentKey="description" label="Process Description" initialValue={get("process", "description")} />
      </CmsSection>
      <CmsSection title="Membership Requirement">
        <TextareaEditor page="guidelines" section="membership" contentKey="body" label="Membership Body Text" initialValue={get("membership", "body")} />
      </CmsSection>
      <CmsSection title="Fees Structure">
        <JsonObjectArrayEditor
          page="guidelines"
          section="fees"
          contentKey="items"
          label="Fees"
          initialValue={get("fees", "items")}
          fields={[
            { key: "who", label: "Who", type: "text" },
            { key: "fee", label: "Fee", type: "text" },
            { key: "note", label: "Note", type: "text" },
          ]}
        />
      </CmsSection>
      <CmsSection title="Requirements">
        <JsonArrayEditor page="guidelines" section="requirements" contentKey="items" label="Requirement List" initialValue={get("requirements", "items")} />
      </CmsSection>
      <CmsSection title="Formatting">
        <JsonObjectArrayEditor
          page="guidelines"
          section="formatting"
          contentKey="items"
          label="Formatting List"
          initialValue={get("formatting", "items")}
          fields={[
            { key: "l", label: "Label", type: "text" },
            { key: "v", label: "Value", type: "text" },
          ]}
        />
      </CmsSection>
      <CmsSection title="Originality & Copyright">
        <JsonArrayEditor page="guidelines" section="originality" contentKey="items" label="Originality Points" initialValue={get("originality", "items")} />
      </CmsSection>
      <CmsSection title="Publication">
        <TextareaEditor page="guidelines" section="publication" contentKey="body" label="Publication Body" initialValue={get("publication", "body")} />
      </CmsSection>
    </div>
  );
}

function StartupSpotlightCms() {
  const { get, loading } = useSiteContent("startup_spotlight");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero">
        <TextFieldEditor page="startup_spotlight" section="hero" contentKey="heading" label="Heading" initialValue={get("hero", "heading")} />
      </CmsSection>
      <CmsSection title="Startups List">
        <JsonObjectArrayEditor
          page="startup_spotlight"
          section="startups"
          contentKey="items"
          label="Startups"
          initialValue={get("startups", "items")}
          fields={[
            { key: "name", label: "Company Name", type: "text" },
            { key: "founder", label: "Founder", type: "text" },
            { key: "innovation", label: "Innovation Description", type: "textarea" },
            { key: "logo_url", label: "Logo", type: "image" },
          ]}
        />
      </CmsSection>
    </div>
  );
}

function ArchivesCms() {
  const { get, loading } = useSiteContent("archives");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero">
        <TextFieldEditor page="archives" section="hero" contentKey="headline" label="Headline" initialValue={get("hero", "headline")} />
        <TextareaEditor page="archives" section="hero" contentKey="subtitle" label="Subtitle" initialValue={get("hero", "subtitle")} />
      </CmsSection>
    </div>
  );
}

function SearchPageCms() {
  const { get, loading } = useSiteContent("search_page");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero">
        <TextFieldEditor page="search_page" section="hero" contentKey="headline" label="Headline" initialValue={get("hero", "headline")} />
      </CmsSection>
    </div>
  );
}

function CurrentIssueCms() {
  const { get, loading } = useSiteContent("current_issue");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Call for Papers">
        <TextFieldEditor page="current_issue" section="call_for_papers" contentKey="heading" label="Heading" initialValue={get("call_for_papers", "heading")} />
        <TextFieldEditor page="current_issue" section="call_for_papers" contentKey="subheading" label="Subheading" initialValue={get("call_for_papers", "subheading")} />
        <TextareaEditor page="current_issue" section="call_for_papers" contentKey="body" label="Body" initialValue={get("call_for_papers", "body")} />
      </CmsSection>
    </div>
  );
}

function SeoCms() {
  const { get, loading } = useSiteContent("seo");
  if (loading) return <Loader2 className="animate-spin" />;

  const pages: { key: keyof SiteContentKeys["seo"]; name: string }[] = [
    { key: "home", name: "Home Page" },
    { key: "about", name: "About Page" },
    { key: "contact", name: "Contact Page" },
    { key: "editorial_board", name: "Editorial Board" },
    { key: "membership", name: "Membership & Pricing" },
    { key: "guidelines", name: "Submission Guidelines" },
    { key: "search", name: "Search Page" },
    { key: "archives", name: "Archives Page" },
    { key: "current_issue", name: "Current Issue Page" },
    { key: "startup_spotlight", name: "Startup Spotlight Page" },
  ];

  return (
    <div className="space-y-6">
      {pages.map((p) => (
        <CmsSection key={p.key} title={p.name}>
          <TextFieldEditor page="seo" section={p.key} contentKey="title" label="Meta Title" initialValue={get(p.key, "title")} />
          <TextareaEditor page="seo" section={p.key} contentKey="description" label="Meta Description" initialValue={get(p.key, "description")} />
        </CmsSection>
      ))}
    </div>
  );
}

