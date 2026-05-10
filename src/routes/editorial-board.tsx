import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { editorialBoard } from "@/lib/mock-data";

export const Route = createFileRoute("/editorial-board")({
  component: Board,
  head: () => ({ meta: [
    { title: "Editorial Board — Agripop" },
    { name: "description", content: "Meet the international editorial board of Agripop magazine." },
  ] }),
});

function Board() {
  const eic = editorialBoard[0];
  const seniors = editorialBoard.filter((e) => e.role === "Senior Editor");
  const associates = editorialBoard.filter((e) => e.role === "Associate Editor");
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Editorial Board</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink max-w-3xl leading-[1.05]">A globally distinguished panel of agricultural scientists.</h1>

        <section className="mt-20 grid md:grid-cols-12 gap-10 items-start bg-paper border border-rule p-10">
          <div className="md:col-span-4 aspect-square bg-muted rounded-sm flex items-center justify-center font-display text-7xl text-primary/40">
            {eic.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="md:col-span-8">
            <div className="eyebrow">Editor-in-Chief</div>
            <h2 className="font-display text-4xl mt-3 text-ink">{eic.name}</h2>
            <div className="text-sm text-muted-foreground mt-2">{eic.inst} · {eic.country}</div>
            <p className="mt-6 text-foreground/75 leading-relaxed max-w-2xl">
              Three decades of leadership in cereal breeding, agronomy and agricultural policy. Author of over 200 peer-reviewed papers and recipient of the Norman Borlaug Medal.
            </p>
          </div>
        </section>

        <Group title="Senior Editors" people={seniors} cols={3} />
        <Group title="Associate Editors" people={associates} cols={4} />
      </main>
      <SiteFooter />
    </>
  );
}

function Group({ title, people, cols }: { title: string; people: typeof editorialBoard; cols: number }) {
  return (
    <section className="mt-20">
      <div className="eyebrow">{title}</div>
      <div className="rule-thick mt-3" />
      <div className={`mt-10 grid sm:grid-cols-2 lg:grid-cols-${cols} gap-x-8 gap-y-12`}>
        {people.map((m) => (
          <div key={m.name}>
            <div className="aspect-square bg-muted rounded-sm flex items-center justify-center font-display text-4xl text-primary/40">
              {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <h4 className="font-display text-lg mt-4">{m.name}</h4>
            <div className="text-xs text-muted-foreground">{m.inst}</div>
            <div className="text-xs text-muted-foreground">{m.country}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
