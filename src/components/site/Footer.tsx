import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const { tr } = useI18n();
  return (
    <footer className="border-t border-border bg-muted/40 mt-20">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold text-primary">{tr("brand")}</h3>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{tr("footer_about")}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">{tr("footer_quick")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary">{tr("nav_home")}</Link></li>
            <li><Link to="/services" className="hover:text-primary">{tr("nav_services")}</Link></li>
            <li><Link to="/egypt-security" className="hover:text-primary">{tr("nav_egypt")}</Link></li>
            <li><Link to="/about" className="hover:text-primary">{tr("nav_about")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">{tr("footer_contact")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="size-4 text-gold" />Dubai, UAE</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-gold" />gunitedtravel@gmail.com</li>
            <li className="flex items-center gap-2"><Phone className="size-4 text-gold" />+249 91 500 5595</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Gunited Travel Agency. {tr("footer_rights")}.
      </div>
    </footer>
  );
}
