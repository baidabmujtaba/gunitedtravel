import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function Header() {
  const { tr, lang, toggle } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const links = [
    { to: "/", label: tr("nav_home") },
    { to: "/services", label: tr("nav_services") },
    { to: "/egypt-security", label: tr("nav_egypt") },
    { to: "/about", label: tr("nav_about") },
    { to: "/contact", label: tr("nav_contact") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-lg font-bold text-primary">
          {tr("brand")}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm transition-colors hover:text-primary ${
                path === l.to ? "text-primary font-medium border-b-2 border-gold pb-1" : "text-foreground/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggle} className="gap-1">
            <Languages className="size-4" />
            <span className="text-xs font-semibold">{lang === "ar" ? "EN" : "AR"}</span>
          </Button>
          <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/contact">{tr("nav_book")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
