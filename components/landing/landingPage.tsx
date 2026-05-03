import { SignInButton } from "@/components/auth/SignInButton";
import {
  featurePanels,
  footerLinks,
  navItems,
  workflowSteps,
} from "@/components/landing/landingContent";
import { LandingThemeToggle } from "@/components/landing/landingThemeToggle";
import { ProductPreview } from "@/components/landing/productPreview";
import { cn } from "@/lib/utils";
import { ArrowRight, Mail } from "lucide-react";

export function LandingPage() {
  return (
    <main className="landing-shell min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[var(--landing-bg)] pt-[65px] text-[var(--landing-text)] transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:pt-0">
      <a
        href="#content"
        className="sr-only cursor-pointer focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-30 focus:rounded-md focus:bg-[var(--landing-inverse)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--landing-inverse-text)]"
      >
        Skip to content
      </a>
      <div className="landing-grain" aria-hidden="true" />
      <LandingNav />
      <HeroSection />
      <ProductSection />
      <WorkflowSection />
      <ActionSection />
      <LandingFooter />
    </main>
  );
}

function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 border-b border-[var(--landing-border)] bg-[var(--landing-bg-translucent)] backdrop-blur-xl md:sticky md:left-auto md:right-auto">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <a
          href="#content"
          className="group flex items-center gap-3 cursor-pointer"
          aria-label="MailPilot home"
        >
          <span className="grid size-8 place-items-center rounded-md border border-[var(--landing-border)] bg-[var(--landing-soft)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5">
            <Mail
              className="size-4 text-[var(--landing-accent)]"
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>
          <span className="text-sm font-semibold tracking-tight">MailPilot</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="cursor-pointer rounded-md px-3 py-2 text-sm text-[var(--landing-muted)] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--landing-soft)] hover:text-[var(--landing-text)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)]"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <LandingThemeToggle />
          <SignInButton className="h-9 rounded-md bg-[var(--landing-inverse)] px-4 text-sm text-[var(--landing-inverse-text)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--landing-inverse-hover)] focus-visible:ring-[var(--landing-focus)] active:scale-[0.98]">
            Sign in
          </SignInButton>
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section id="content" className="landing-grid-bg relative scroll-mt-[65px] md:scroll-mt-0">
      <div className="mx-auto grid min-h-[calc(100dvh-65px)] max-w-[1680px] grid-cols-1 items-center gap-12 px-[clamp(1.5rem,5vw,6rem)] py-16 md:py-24 xl:grid-cols-[minmax(340px,0.72fr)_minmax(740px,1.28fr)] xl:gap-16">
        <div className="landing-reveal max-w-4xl space-y-7">
          <p className="max-w-2xl text-sm font-medium leading-6 text-[var(--landing-accent)]">
            AI that operates your Gmail.
          </p>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-balance text-[clamp(2.75rem,4.45vw,4.55rem)] font-semibold leading-[0.91] tracking-[-0.045em] text-[var(--landing-text)]">
              Your inbox, operated by AI.
            </h1>
            <p className="max-w-xl text-pretty text-base leading-7 text-[var(--landing-muted)] sm:text-lg">
              MailPilot operates Gmail for you — finding threads, changing views, opening compose,
              and preparing replies. Every important action waits for your approval.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SignInButton className="h-12 rounded-md bg-[var(--landing-inverse)] px-5 text-base text-[var(--landing-inverse-text)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--landing-inverse-hover)] focus-visible:ring-[var(--landing-focus)] active:scale-[0.98]">
              <span className="flex items-center gap-3">
                Connect Gmail
                <span className="grid size-7 place-items-center rounded-[6px] bg-[var(--landing-inverse-soft)]">
                  <ArrowRight className="size-4" strokeWidth={1.7} aria-hidden="true" />
                </span>
              </span>
            </SignInButton>
            <a
              href="#product"
              className="cursor-pointer inline-flex h-12 items-center justify-center gap-3 rounded-md border border-[var(--landing-border)] bg-[var(--landing-panel)] px-5 text-base font-medium text-[var(--landing-text)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--landing-border-strong)] hover:bg-[var(--landing-soft)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)] active:scale-[0.98]"
            >
              See how it works
              <ArrowRight className="size-4" strokeWidth={1.7} aria-hidden="true" />
            </a>
          </div>

          <p className="max-w-xl border-l border-[var(--landing-border-strong)] pl-4 text-sm leading-6 text-[var(--landing-faint)]">
            Not a chatbot. A visible agent that operates the UI, handles the busywork, and leaves
            the final call to you.
          </p>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}

function ProductSection() {
  return (
    <section id="product" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 md:py-36 lg:px-8">
      <SectionIntro
        eyebrow="Product"
        title="AI that operates the interface. Not another chat box."
        description="The agent changes views, applies filters, and prepares drafts while you watch. Every action stays reviewable."
      />

      <div className="mt-14 grid grid-cols-1 gap-3 md:grid-cols-12 md:grid-flow-dense">
        {featurePanels.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className={cn(
                "landing-reveal min-h-[260px] rounded-lg border border-[var(--landing-border)] bg-[var(--landing-panel)] p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[var(--landing-accent-border)] hover:shadow-[0_18px_60px_var(--landing-hover-shadow)] md:p-8",
                feature.className
              )}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex h-full flex-col">
                <div className="mb-10 grid size-11 place-items-center rounded-md bg-[var(--landing-accent-soft)] text-[var(--landing-accent)]">
                  <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                </div>
                <div className="mt-auto">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{feature.title}</h3>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--landing-copy)]">
                    {feature.description}
                  </p>
                  <p className="mt-6 border-t border-[var(--landing-border)] pt-4 text-sm font-medium text-[var(--landing-accent)]">
                    {feature.detail}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="border-y border-[var(--landing-border)] bg-[var(--landing-band)] px-4 py-24 sm:px-6 md:py-36 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionIntro
          eyebrow="Workflow"
          title="Ask. Watch. Approve."
          description="Tell the agent what you need in plain language. Watch it operate the interface. Inspect the result and approve when it's right."
        />

        <div className="landing-reveal divide-y divide-[var(--landing-border)] border-y border-[var(--landing-border)] bg-[var(--landing-bg)]">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article key={step.title} className="grid gap-5 p-6 sm:grid-cols-[96px_1fr] md:p-8">
                <div className="flex items-center gap-3 sm:block">
                  <span className="font-mono text-sm text-[var(--landing-faint)]">
                    0{index + 1}
                  </span>
                  <span className="ml-auto grid size-10 place-items-center rounded-md bg-[var(--landing-accent-soft)] text-[var(--landing-accent)] sm:ml-0 sm:mt-6">
                    <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em]">{step.title}</h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--landing-copy)]">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ActionSection() {
  return (
    <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="landing-reveal mx-auto max-w-7xl rounded-lg border border-[var(--landing-border)] bg-[var(--landing-inverse)] p-6 text-[var(--landing-inverse-text)] md:p-10 lg:p-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-[var(--landing-inverse-muted)]">
              Give your inbox an operator.
            </p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Let the agent handle the UI work you repeat every day.
            </h2>
          </div>
          <div className="flex items-center">
            <SignInButton className="h-12 rounded-md bg-[var(--landing-bg)] px-5 text-base text-[var(--landing-text)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--landing-soft)] focus-visible:ring-[var(--landing-focus-inverse)] active:scale-[0.98]">
              Sign in with Google
            </SignInButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-[var(--landing-border)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[var(--landing-muted)] sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between">
        <p>MailPilot lets AI operate your email. Every important action stays reviewable.</p>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--landing-text)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--landing-focus)]"
            >
              {link.label}
            </a>
          ))}
          <span className="text-[var(--landing-faint)]">
            © {new Date().getFullYear()} MailPilot. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="landing-reveal max-w-4xl">
      <p className="text-sm font-medium text-[var(--landing-accent)]">{eyebrow}</p>
      <h2 className="mt-5 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-[var(--landing-copy)]">
        {description}
      </p>
    </div>
  );
}
