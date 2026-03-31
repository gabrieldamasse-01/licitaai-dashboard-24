import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Menu, X, FileSearch, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { TextEffect } from '@/components/ui/text-effect';
import { cn } from '@/lib/utils';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden bg-background">
        {/* Decorative background */}
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(215,50%,40%,.12)_0,hsla(215,50%,30%,.04)_50%,hsla(215,50%,20%,0)_80%)] absolute left-0 top-0" />
          <div className="h-320 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(215,50%,40%,.08)_0,hsla(215,50%,20%,.02)_80%,transparent_100%)] absolute left-0 top-0" />
          <div className="h-320 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(215,50%,40%,.06)_0,hsla(215,50%,20%,.02)_80%,transparent_100%)] absolute -left-20 top-0 w-96" />
        </div>

        {/* Hero */}
        <section>
          <div className="relative pt-24 md:pt-36">
            <AnimatedGroup
              variants={transitionVariants}
              className="mx-auto flex max-w-5xl flex-col items-center px-6"
            >
              <Link
                to="/matches"
                className="hover:bg-slate-100 bg-slate-50 group mx-auto flex w-fit items-center gap-4 rounded-full border border-slate-200 p-1 pl-4 shadow-md shadow-slate-950/5 transition-all duration-300"
              >
                <span className="text-slate-700 text-sm font-medium">IA que encontra licitações para você</span>
                <span className="bg-white group-hover:bg-slate-100 block size-6 overflow-hidden rounded-full duration-500">
                  <div className="flex w-12 -translate-x-1/2 items-center justify-center transition-transform duration-500 ease-in-out group-hover:translate-x-0">
                    <ArrowRight className="size-4 text-slate-800" />
                    <ArrowRight className="size-4 text-slate-800" />
                  </div>
                </span>
              </Link>

              <TextEffect
                preset="fade"
                per="word"
                as="h1"
                className="mt-8 text-balance text-center text-4xl font-bold text-slate-900 md:text-6xl lg:mt-16"
              >
                Ganhe mais licitações com inteligência artificial
              </TextEffect>

              <TextEffect
                per="word"
                as="p"
                preset="fade"
                delay={0.5}
                className="mx-auto mt-8 max-w-2xl text-balance text-center text-lg text-slate-500"
              >
                O LicitaAI monitora editais, analisa documentos e cruza oportunidades automaticamente para sua empresa nunca perder um prazo.
              </TextEffect>

              <div className="mt-12 flex items-center justify-center gap-3">
                <Button size="lg" asChild className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Link to="/">
                    <span>Acessar Dashboard</span>
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  <Link to="/empresas">Cadastrar Empresa</Link>
                </Button>
              </div>
            </AnimatedGroup>

            {/* Features grid */}
            <AnimatedGroup
              variants={{
                container: {
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 },
                  },
                },
                item: {
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring' as const, bounce: 0.3, duration: 2 },
                  },
                },
              }}
              className="relative mx-auto mt-20 max-w-5xl px-6"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <FeatureCard
                  icon={<FileSearch className="size-6 text-slate-700" />}
                  title="Monitoramento de Editais"
                  description="Busca automática de licitações compatíveis com o perfil da sua empresa."
                />
                <FeatureCard
                  icon={<Zap className="size-6 text-amber-600" />}
                  title="Match por IA"
                  description="Score inteligente que cruza seus documentos com os requisitos do edital."
                />
                <FeatureCard
                  icon={<Shield className="size-6 text-emerald-600" />}
                  title="Gestão de Documentos"
                  description="Upload, validação e alerta de vencimento de certidões e atestados."
                />
                <FeatureCard
                  icon={<BarChart3 className="size-6 text-blue-600" />}
                  title="Dashboard Completo"
                  description="Visão geral de oportunidades, documentos e status em tempo real."
                />
              </div>
            </AnimatedGroup>

            {/* Dashboard preview */}
            <AnimatedGroup
              variants={{
                container: {
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                },
                item: {
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring' as const, bounce: 0.3, duration: 2 },
                  },
                },
              }}
              className="relative mx-auto mt-16 max-w-4xl px-6"
            >
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10 ring-1 ring-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=2400&auto=format&fit=crop&q=80"
                  alt="Preview do dashboard LicitaAI"
                  className="w-full rounded-2xl"
                />
              </div>
            </AnimatedGroup>
          </div>
        </section>

        {/* Stats section */}
        <section className="bg-background pb-16 pt-20 md:pb-32">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <p className="text-slate-500 text-center text-sm font-medium uppercase tracking-wider">
                Resultados que importam
              </p>
              <h2 className="mt-4 text-center text-2xl font-bold text-slate-900 md:text-3xl">
                Empresas que usam LicitaAI ganham mais
              </h2>
            </div>

            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
              <StatCard value="3x" label="mais licitações encontradas" />
              <StatCard value="85%" label="de redução no tempo de análise" />
              <StatCard value="0" label="documentos vencidos sem alerta" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300">
    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-slate-50">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
);

const StatCard = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-4xl font-bold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{label}</p>
  </div>
);

const menuItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'Empresas', href: '/empresas' },
  { name: 'Documentos', href: '/documentos' },
  { name: 'Matches', href: '/matches' },
];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={isScrolled ? 'scrolled' : 'top'}
        className="fixed z-20 w-full px-2 data-[state=scrolled]:shadow-md"
      >
        <div
          className={cn(
            'mx-auto mt-2 max-w-5xl rounded-2xl border border-slate-200 px-6 py-3 transition-all duration-300 lg:px-12',
            isScrolled
              ? 'bg-white/80 backdrop-blur-lg'
              : 'bg-white'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0">
            <div className="flex w-full items-center justify-between gap-6 lg:w-auto">
              <Link to="/landing" aria-label="LicitaAI" className="flex items-center gap-2">
                <Logo />
                <span className="text-lg font-bold text-slate-900">LicitaAI</span>
              </Link>
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Fechar Menu' : 'Abrir Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className={cn('m-auto size-6 text-slate-700 duration-200', menuState && 'rotate-180 scale-0')} />
                <X className={cn('absolute inset-0 m-auto size-6 text-slate-700 duration-200', !menuState && '-rotate-180 scale-0')} />
              </button>
            </div>

            <div className="hidden lg:flex lg:items-center lg:gap-6">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link to={item.href} className="text-slate-500 hover:text-slate-900 block font-medium duration-150">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn('bg-white mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-slate-200 p-6 shadow-2xl shadow-slate-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none', menuState ? 'flex' : 'hidden')}>
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href} className="text-slate-500 hover:text-slate-900 block font-medium duration-150">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button size="sm" asChild className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Link to="/">
                    <span>Entrar</span>
                    <ChevronRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Logo = ({ className }: { className?: string }) => {
  return (
    <svg className={cn('size-8', className)} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#1e293b" />
      <path d="M10 8h4v16h-4V8z" fill="#f8fafc" opacity="0.9" />
      <path d="M16 8h4l4 8-4 8h-4l4-8-4-8z" fill="#f8fafc" />
    </svg>
  );
};
