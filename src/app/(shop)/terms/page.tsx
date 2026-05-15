"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  FileText,
  Globe,
  Lock,
  MessageCircle,
  Scale,
  ShoppingCart,
  UserCheck,
  XCircle,
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

function BulletList({
  items,
  type = "check",
}: {
  items: string[];
  type?: "check" | "cross";
}) {
  return (
    <ul className="space-y-3 mt-4">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
          {type === "check" ? (
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-primary" />
          ) : (
            <XCircle size={16} className="mt-0.5 flex-shrink-0 text-destructive" />
          )}
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

// --- Page Content ---

export default function TermsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("acceptance");

  const sections = [
    {
      id: "acceptance",
      title: t("terms_acceptance_title"),
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("terms_acceptance_desc1").split("Technologia")[0]}
            <Highlight>Technologia</Highlight>
            {t("terms_acceptance_desc1").split("Technologia")[1]}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("terms_acceptance_desc2")}
          </p>
        </div>
      ),
    },
    {
      id: "account",
      title: t("terms_account_title"),
      icon: <UserCheck className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("terms_account_desc")}
          </p>
          <BulletList
            items={[
              t("terms_account_item1"),
              t("terms_account_item2"),
              t("terms_account_item3"),
              t("terms_account_item4"),
            ]}
          />
          <div className="mt-8 rounded-3xl bg-destructive/5 border border-destructive/10 p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-destructive/10 transition-colors" />
            
            <h5 className="text-sm font-black text-destructive mb-4 flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              {t("terms_prohibited_title")}
            </h5>
            
            <BulletList
              type="cross"
              items={[
                t("terms_prohibited_item1"),
                t("terms_prohibited_item2"),
                t("terms_prohibited_item3"),
              ]}
            />
          </div>
        </div>
      ),
    },
    {
      id: "purchase",
      title: t("terms_purchase_title"),
      icon: <ShoppingCart className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("terms_purchase_desc").split("Technologia")[0]}
            <Highlight>Technologia</Highlight>
            {t("terms_purchase_desc").split("Technologia")[1]}
          </p>
          <BulletList
            items={[
              t("terms_purchase_item1"),
              t("terms_purchase_item2"),
              t("terms_purchase_item3"),
              t("terms_purchase_item4"),
            ]}
          />
        </div>
      ),
    },
    {
      id: "privacy",
      title: t("terms_privacy_title"),
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("terms_privacy_desc").split("Nghị định 13/2023/NĐ-CP")[0]}
            <Highlight>Nghị định 13/2023/NĐ-CP</Highlight>
            {t("terms_privacy_desc").split("Nghị định 13/2023/NĐ-CP")[1]}
          </p>
          <BulletList
            items={[
              t("terms_privacy_item1"),
              t("terms_privacy_item2"),
              t("terms_privacy_item3"),
              t("terms_privacy_item4"),
            ]}
          />
        </div>
      ),
    },
    {
      id: "law",
      title: t("terms_law_title"),
      icon: <Scale className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {t("terms_law_desc").split("Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam")[0]}
            <Highlight>Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam</Highlight>
            {t("terms_law_desc").split("Nước Cộng hòa Xã hội Chủ nghĩa Việt Nam")[1]}
          </p>
          <div className="grid gap-4">
            {[
              { step: "1", label: t("terms_law_step1_label"), desc: t("terms_law_step1_desc") },
              { step: "2", label: t("terms_law_step2_label"), desc: t("terms_law_step2_desc") },
              { step: "3", label: t("terms_law_step3_label"), desc: t("terms_law_step3_desc") },
            ].map((s) => (
              <div key={s.step} className="group flex items-center gap-6 p-5 rounded-2xl border border-border-soft bg-surface transition-all duration-300 hover:border-primary/40 hover:shadow-premium hover:-translate-y-1">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                    {s.step}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface border-2 border-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{s.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
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
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6 border border-border-soft">
            <Globe size={14} className="text-primary" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("terms_effective_date")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">
            {t("terms_title").split(" ")[0]} <span className="text-primary">{t("terms_title").split(" ")[1]}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("terms_subtitle")}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              { icon: <BadgeCheck size={16} />, label: t("terms_badge_genuine") },
              { icon: <Lock size={16} />, label: t("terms_badge_privacy") },
              { icon: <Scale size={16} />, label: t("terms_badge_law") },
            ].map((b, i) => (
              <Badge key={i} variant="secondary" className="px-6 py-2.5 rounded-2xl gap-3 border border-border-soft bg-surface shadow-premium hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                <div className="text-primary">{b.icon}</div>
                <span className="text-primary-strong font-bold tracking-tight">{b.label}</span>
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-24 space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 mb-4">
                {t("terms_nav_title")}
              </h3>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-sm font-semibold text-left ${activeTab === section.id
                    ? "bg-primary text-primary-foreground shadow-premium"
                    : "text-muted-foreground hover:bg-accent hover:text-primary"
                    }`}
                >
                  {section.icon}
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3 space-y-10">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-premium border border-border-soft hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                  </div>

                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {section.content}
                  </div>
                </div>
              </section>
            ))}

            {/* Chatbot Note */}
            <div className="bg-primary-soft/30 rounded-2xl p-6 md:p-8 border border-primary/20 flex flex-col md:flex-row items-center gap-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shadow-lg animate-pulse">
                <MessageCircle width={32} height={32} />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-lg font-bold text-primary-strong mb-2">{t("terms_chatbot_title")}</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {t("terms_chatbot_desc").split("Lạc Lạc")[0]}
                  <span className="text-primary font-bold">Lạc Lạc</span>
                  {t("terms_chatbot_desc").split("Lạc Lạc")[1]}
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground pt-10">
              {t("terms_copyright")}
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
