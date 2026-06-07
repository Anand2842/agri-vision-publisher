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
          <TabsTrigger value="advertise">Advertise</TabsTrigger>
          <TabsTrigger value="publication_ethics">Publication Ethics</TabsTrigger>
          <TabsTrigger value="certificate">Certificates</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
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
        <TabsContent value="advertise">
          <AdvertiseCms />
        </TabsContent>
        <TabsContent value="publication_ethics">
          <PublicationEthicsCms />
        </TabsContent>
        <TabsContent value="certificate">
          <CertificateCms />
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
      <CmsSection title="Legal / ISSN">
        <TextFieldEditor page="footer" section="legal" contentKey="publisher_name" label="Publisher Name" initialValue={get("legal", "publisher_name")} />
        <TextFieldEditor page="footer" section="legal" contentKey="eissn" label="E-ISSN (Online)" initialValue={get("legal", "eissn")} />
        <TextFieldEditor page="footer" section="legal" contentKey="pissn" label="P-ISSN (Print)" initialValue={get("legal", "pissn")} />
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
            { key: "amount", label: "Amount (numeric for pricing logic)", type: "number" },
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
        <TextFieldEditor page="membership" section="payment" contentKey="upi_number" label="UPI Phone Number / ID" initialValue={get("payment", "upi_number")} />
        <ImageUploadEditor page="membership" section="payment" contentKey="upi_qr_url" label="UPI / PhonePe QR Code Image" initialValue={get("payment", "upi_qr_url")} />
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
    { key: "publication_ethics", name: "Publication Ethics Page" },
    { key: "advertise", name: "Advertise Page" },
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

function PublicationEthicsCms() {
  const { get, loading } = useSiteContent("publication_ethics");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero">
        <TextFieldEditor page="publication_ethics" section="hero" contentKey="eyebrow" label="Eyebrow Text" initialValue={get("hero", "eyebrow")} />
        <TextFieldEditor page="publication_ethics" section="hero" contentKey="title" label="Title" initialValue={get("hero", "title")} />
        <TextareaEditor page="publication_ethics" section="hero" contentKey="body" label="Body" initialValue={get("hero", "body")} />
      </CmsSection>
      <CmsSection title="1. Originality & Plagiarism">
        <TextFieldEditor page="publication_ethics" section="originality" contentKey="title" label="Section Title" initialValue={get("originality", "title")} />
        <TextareaEditor page="publication_ethics" section="originality" contentKey="body" label="Section Body" initialValue={get("originality", "body")} />
        <JsonArrayEditor page="publication_ethics" section="originality" contentKey="points" label="Bullet Points" initialValue={get("originality", "points")} />
      </CmsSection>
      <CmsSection title="2. Authorship">
        <TextFieldEditor page="publication_ethics" section="authorship" contentKey="title" label="Section Title" initialValue={get("authorship", "title")} />
        <TextareaEditor page="publication_ethics" section="authorship" contentKey="body" label="Section Body" initialValue={get("authorship", "body")} />
      </CmsSection>
      <CmsSection title="3. Peer Review">
        <TextFieldEditor page="publication_ethics" section="peer_review" contentKey="title" label="Section Title" initialValue={get("peer_review", "title")} />
        <TextareaEditor page="publication_ethics" section="peer_review" contentKey="body" label="Section Body" initialValue={get("peer_review", "body")} />
      </CmsSection>
      <CmsSection title="4. Conflicts of Interest">
        <TextFieldEditor page="publication_ethics" section="conflicts" contentKey="title" label="Section Title" initialValue={get("conflicts", "title")} />
        <TextareaEditor page="publication_ethics" section="conflicts" contentKey="body" label="Section Body" initialValue={get("conflicts", "body")} />
      </CmsSection>
      <CmsSection title="5. Corrections, Retractions & Misconduct">
        <TextFieldEditor page="publication_ethics" section="corrections" contentKey="title" label="Section Title" initialValue={get("corrections", "title")} />
        <TextareaEditor page="publication_ethics" section="corrections" contentKey="body" label="Section Body" initialValue={get("corrections", "body")} />
      </CmsSection>
      <CmsSection title="6. Open Access & Copyright">
        <TextFieldEditor page="publication_ethics" section="open_access" contentKey="title" label="Section Title" initialValue={get("open_access", "title")} />
        <TextareaEditor page="publication_ethics" section="open_access" contentKey="body" label="Section Body" initialValue={get("open_access", "body")} />
      </CmsSection>
      <CmsSection title="7. Reporting Concerns">
        <TextFieldEditor page="publication_ethics" section="reporting" contentKey="title" label="Section Title" initialValue={get("reporting", "title")} />
        <TextareaEditor page="publication_ethics" section="reporting" contentKey="body" label="Section Body (HTML allowed for links)" initialValue={get("reporting", "body")} />
      </CmsSection>
    </div>
  );
}

function CertificateCms() {
  const { get, loading } = useSiteContent("certificate");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Branding">
        <TextFieldEditor page="certificate" section="branding" contentKey="magazine_name" label="Magazine Title" initialValue={get("branding", "magazine_name")} />
        <TextFieldEditor page="certificate" section="branding" contentKey="publisher" label="Publisher Name" initialValue={get("branding", "publisher")} />
      </CmsSection>
      <CmsSection title="Editor-in-Chief Seal & Details">
        <TextFieldEditor page="certificate" section="branding" contentKey="chief_editor" label="Chief Editor Name" initialValue={get("branding", "chief_editor")} />
        <TextFieldEditor page="certificate" section="branding" contentKey="chief_editor_title" label="Chief Editor Title" initialValue={get("branding", "chief_editor_title")} />
        <TextFieldEditor page="certificate" section="branding" contentKey="chief_editor_signature" label="Chief Editor Signature Text (Simulated Handwriting)" initialValue={get("branding", "chief_editor_signature")} />
        <TextFieldEditor page="certificate" section="branding" contentKey="seal_text" label="Seal Text Circular (Publication Certificate)" initialValue={get("branding", "seal_text")} />
      </CmsSection>
      <CmsSection title="Publisher Signatures & Details">
        <TextFieldEditor page="certificate" section="branding" contentKey="publisher_signature" label="Publisher Signature Text (Simulated Handwriting)" initialValue={get("branding", "publisher_signature")} />
        <TextFieldEditor page="certificate" section="branding" contentKey="publisher_title" label="Publisher Title" initialValue={get("branding", "publisher_title")} />
        <TextFieldEditor page="certificate" section="branding" contentKey="publisher_institution" label="Publisher Institution" initialValue={get("branding", "publisher_institution")} />
        <TextFieldEditor page="certificate" section="branding" contentKey="seal_text_membership" label="Seal Text Circular (Membership Certificate)" initialValue={get("branding", "seal_text_membership")} />
      </CmsSection>
    </div>
  );
}

function AdvertiseCms() {
  const { get, loading } = useSiteContent("advertise");
  if (loading) return <Loader2 className="animate-spin" />;
  return (
    <div className="space-y-6">
      <CmsSection title="Hero">
        <TextFieldEditor page="advertise" section="hero" contentKey="heading" label="Heading" initialValue={get("hero", "heading")} />
        <TextareaEditor page="advertise" section="hero" contentKey="body" label="Body" initialValue={get("hero", "body")} />
      </CmsSection>
      <CmsSection title="Benefits">
        <JsonObjectArrayEditor
          page="advertise"
          section="benefits"
          contentKey="items"
          label="Benefits List"
          initialValue={get("benefits", "items")}
          fields={[
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "icon", label: "Icon Name (e.g. Users, BarChart3, Globe2, Award)", type: "text" }
          ]}
        />
      </CmsSection>
      <CmsSection title="Audience Statistics">
        <JsonObjectArrayEditor
          page="advertise"
          section="audience"
          contentKey="stats"
          label="Stats List"
          initialValue={get("audience", "stats")}
          fields={[
            { key: "value", label: "Value (e.g. 50,000+)", type: "text" },
            { key: "label", label: "Label (e.g. Monthly Readers)", type: "text" }
          ]}
        />
      </CmsSection>
      <CmsSection title="Sponsorship Packages">
        <JsonObjectArrayEditor
          page="advertise"
          section="sponsorship"
          contentKey="packages"
          label="Packages"
          initialValue={get("sponsorship", "packages")}
          fields={[
            { key: "name", label: "Package Name", type: "text" },
            { key: "price", label: "Price Text", type: "text" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "features", label: "Features (Comma separated)", type: "array" },
            { key: "cta", label: "CTA Button Text", type: "text" },
            { key: "highlighted", label: "Highlighted / Featured (Boolean)", type: "boolean" }
          ]}
        />
      </CmsSection>
    </div>
  );
}


