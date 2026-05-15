"use client";

import {
  CheckCircle2,
  Clock,
  CreditCard,
  Droplets,
  History,
  Info,
  MessageCircle,
  Package,
  ShieldCheck,
  Truck,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language.provider";

// --- Components ---

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <strong className="text-primary-strong font-bold">
      {children}
    </strong>
  );
}

function PackageTag({ title, items, color = "primary", icon }: { title: string; items: string[]; color?: "primary" | "secondary" | "accent"; icon?: React.ReactNode }) {
  const colorMap = {
    primary: "bg-primary/5 border-primary/20 text-primary-strong",
    secondary: "bg-secondary/5 border-secondary/20 text-secondary-foreground bg-secondary/10",
    accent: "bg-accent border-accent-foreground/10 text-accent-foreground"
  };

  const iconColorMap = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/20 text-secondary-foreground",
    accent: "bg-accent-foreground/10 text-accent-foreground"
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${colorMap[color]}`}>
      <h5 className="font-bold text-sm mb-4 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColorMap[color]}`}>
          {icon || <Package size={16} />}
        </div>
        {title}
      </h5>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs font-medium leading-relaxed opacity-90">
            <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="group flex items-center gap-5 p-5 rounded-2xl bg-surface border border-border-soft transition-all duration-300 hover:border-primary/40 hover:shadow-premium hover:-translate-y-1">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1.5 opacity-70">{label}</p>
        <p className="text-sm font-bold text-foreground leading-tight">{value}</p>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
    </div>
  );
}

// --- Page Content ---

export default function PolicyPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("warranty");

  const sections = [
    {
      id: "warranty",
      title: t("policy_warranty_title"),
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: t("policy_warranty_badge"),
      content: (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("policy_warranty_desc")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PackageTag
              title={t("policy_warranty_vip_title")}
              color="primary"
              icon={<ShieldCheck size={18} />}
              items={[
                t("policy_warranty_vip_item1"),
                t("policy_warranty_vip_item2"),
                t("policy_warranty_vip_item3"),
              ]}
            />
            <PackageTag
              title={t("policy_warranty_damage_title")}
              color="accent"
              icon={<Droplets size={18} />}
              items={[
                t("policy_warranty_damage_item1"),
                t("policy_warranty_damage_item2"),
                t("policy_warranty_damage_item3"),
              ]}
            />
            <PackageTag
              title={t("policy_warranty_extended_title")}
              color="primary"
              icon={<Zap size={18} />}
              items={[
                t("policy_warranty_extended_item1"),
                t("policy_warranty_extended_item2"),
                t("policy_warranty_extended_item3"),
              ]}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/5 p-3 rounded-xl border border-destructive/10">
            <Info size={14} />
            <span>{t("policy_warranty_vip_note")}</span>
          </div>
        </div>
      ),
    },
    {
      id: "shipping",
      title: t("policy_shipping_title"),
      icon: <Truck className="w-5 h-5" />,
      badge: t("policy_shipping_badge"),
      content: (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("policy_shipping_desc")}
          </p>
          <div className="grid gap-4">
            <InfoRow
              label={t("policy_shipping_city")}
              value={t("policy_shipping_city_value")}
              icon={<Clock size={16} />}
            />
            <InfoRow
              label={t("policy_shipping_suburb")}
              value={t("policy_shipping_suburb_value")}
              icon={<History size={16} />}
            />
            <InfoRow
              label={t("policy_shipping_country")}
              value={t("policy_shipping_country_value")}
              icon={<Package size={16} />}
            />
            <InfoRow
              label={t("policy_shipping_free")}
              value={t("policy_shipping_free_value")}
              icon={<ShieldCheck size={16} />}
            />
          </div>
        </div>
      ),
    },
    {
      id: "payment",
      title: t("policy_payment_title"),
      icon: <CreditCard className="w-5 h-5" />,
      content: (
        <div className="space-y-8">
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Wallet size={16} className="text-primary" /> {t("policy_payment_methods_title")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                t("policy_payment_cash"),
                t("policy_payment_transfer"),
                t("policy_payment_wallet"),
                t("policy_payment_installment"),
              ].map((m) => (
                <span key={m} className="px-4 py-2 rounded-xl bg-surface border border-border-soft text-xs font-semibold text-muted-foreground shadow-sm">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <History size={16} className="text-primary" /> {t("policy_payment_refund_title")}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("policy_payment_cash"), value: t("policy_refund_cash_value") },
                { label: t("policy_payment_transfer"), value: t("policy_refund_transfer_value") },
                { label: t("policy_payment_wallet"), value: t("policy_refund_wallet_value") },
                { label: "Visa/Mastercard", value: t("policy_refund_credit_value") },
              ].map((r) => (
                <div key={r.label} className="group p-5 rounded-2xl bg-surface border border-border-soft text-center transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-1">
                  <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-2 opacity-60 group-hover:text-primary transition-colors">{r.label}</p>
                  <p className="text-xs font-black text-primary-strong group-hover:scale-105 transition-transform">{r.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "returns",
      title: t("policy_return_title"),
      icon: <History className="w-5 h-5" />,
      badge: t("policy_return_badge"),
      content: (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">{t("policy_return_time_label")}</p>
              <h4 className="text-3xl font-black text-primary-strong mb-2">{t("policy_return_time_value")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("policy_return_desc")}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" /> {t("policy_inspect_title")}
            </h4>
            <ul className="grid gap-3">
              {[
                t("policy_inspect_item1"),
                t("policy_inspect_item2"),
                t("policy_inspect_item3"),
                t("policy_inspect_item4"),
              ].map((item, i) => (
                <li key={i} className="group flex items-start gap-4 p-5 rounded-2xl bg-surface border border-border-soft text-sm text-muted-foreground leading-relaxed transition-all duration-300 hover:border-primary/20 hover:bg-primary/5">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="group-hover:text-foreground transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "data",
      title: t("policy_data_title"),
      icon: <Info className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-accent/5 border border-accent/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/20 transition-colors" />

            <h4 className="font-bold text-accent-foreground mb-4 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-accent-foreground/10 flex items-center justify-center">
                <Info size={20} />
              </div>
              {t("policy_data_backup_title")}
            </h4>

            <p className="text-sm text-muted-foreground leading-relaxed mb-8 relative z-10">
              {t("policy_data_desc")}
            </p>

            <ul className="space-y-4 relative z-10">
              {[
                t("policy_data_item1"),
                t("policy_data_item2"),
                t("policy_data_item3"),
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-xs font-bold text-muted-foreground group/item">
                  <div className="w-2 h-2 rounded-full bg-accent group-hover/item:scale-150 transition-transform" />
                  <span className="group-hover/item:text-accent-foreground transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-surface-soft py-16 md:py-24 border-b border-border-soft relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            {t("policy_title").split(" & ")[0]} <span className="text-primary">& {t("policy_title").split(" & ")[1]}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("policy_subtitle")}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-24 space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">
                {t("policy_nav_title")}
              </h3>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-semibold text-left ${activeTab === section.id
                    ? "bg-primary text-primary-foreground shadow-premium"
                    : "text-muted-foreground hover:bg-accent hover:text-primary"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    {section.title}
                  </div>
                  {section.badge && activeTab !== section.id && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {section.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="lg:col-span-3 space-y-12">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <div className="bg-surface rounded-2xl p-6 md:p-10 shadow-premium border border-border-soft hover:border-primary/30 transition-all duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        {section.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                    </div>
                    {section.badge && (
                      <Badge variant="secondary" className="w-fit px-4 py-1.5 rounded-full bg-primary/5 text-primary border-primary/10 font-bold">
                        {section.badge}
                      </Badge>
                    )}
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {section.content}
                  </div>
                </div>
              </section>
            ))}

            {/* Chatbot Lạc Lạc Note */}
            <div className="bg-primary-soft/30 rounded-2xl p-6 md:p-10 border border-primary/20 flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white shadow-lg animate-pulse">
                <MessageCircle width={40} height={40} />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-xl font-bold text-primary-strong mb-2">{t("policy_chatbot_title")}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {t("policy_chatbot_desc").split("Lạc Lạc")[0]}
                  <span className="text-primary font-bold">Lạc Lạc</span>
                  {t("policy_chatbot_desc").split("Lạc Lạc")[1]}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
