import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Menu, X } from 'lucide-react';
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
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
        >
          <div className="w-140 h-320 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)] absolute left-0 top-0" />
          <div className="h-320 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] absolute left-0 top-0" />
          <div className="h-320 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] absolute -left-20 top-0 w-96" />
        </div>
        <section>
          <div className="relative pt-24 md:pt-36">
            <AnimatedGroup
              variants={transitionVariants}
              className="mx-auto flex max-w-5xl flex-col items-center px-6"
            >
              <Link
                to="#"
                className="hover:bg-muted bg-muted/50 group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-all duration-300"
              >
                <span className="text-foreground text-sm">Introducing Support for AI Models</span>
                <span className="bg-background group-hover:bg-muted block size-6 overflow-hidden rounded-full duration-500">
                  <div className="flex w-12 -translate-x-1/2 items-center justify-center transition-transform duration-500 ease-in-out group-hover:translate-x-0">
                    <ArrowRight className="size-4" />
                    <ArrowRight className="size-4" />
                  </div>
                </span>
              </Link>

              <TextEffect
                preset="fade"
                per="word"
                as="h1"
                className="mt-8 text-balance text-center text-4xl font-bold md:text-6xl lg:mt-16"
              >
                Modern Solutions for Customer Engagement
              </TextEffect>

              <TextEffect
                per="word"
                as="p"
                preset="fade"
                delay={0.5}
                className="mx-auto mt-8 max-w-2xl text-balance text-center text-lg text-muted-foreground"
              >
                Highly customizable components for building modern websites and applications that look and feel the way you mean it.
              </TextEffect>

              <div className="mt-12 flex items-center justify-center gap-2">
                <div key={1}>
                  <Button size="lg" asChild>
                    <Link to="#">
                      <span>Start Building</span>
                      <ArrowRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </div>
                <Button size="lg" variant="ghost" asChild>
                  <Link to="#">Request a demo</Link>
                </Button>
              </div>
            </AnimatedGroup>

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
                    transition: { type: 'spring', bounce: 0.3, duration: 2 },
                  },
                },
              }}
              className="relative mx-auto mt-20 max-w-4xl px-6"
            >
              <div className="rounded-2xl border bg-background shadow-lg shadow-zinc-950/15 ring-1 ring-border">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=2400&auto=format&fit=crop&q=80"
                  alt="App dashboard preview"
                  className="w-full rounded-2xl"
                />
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <section className="bg-background pb-16 pt-20 md:pb-32">
          <div className="group mx-auto max-w-5xl px-6">
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <p className="text-muted-foreground text-center text-sm font-medium">
                Meet Our Customers
              </p>
            </div>

            <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-70 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0">
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/images/clients/airbnb.svg"
                alt="Airbnb Logo"
                height="20"
                width="auto"
              />
              <img
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/images/clients/ge.svg"
                alt="GE Logo"
                height="16"
                width="auto"
              />
              <img
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/images/clients/google.svg"
                alt="Google Logo"
                height="16"
                width="auto"
              />
              <img
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/images/clients/microsoft.svg"
                alt="Microsoft Logo"
                height="16"
                width="auto"
              />
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/images/clients/nvidia.svg"
                alt="Nvidia Logo"
                height="20"
                width="auto"
              />
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/images/clients/samsung.svg"
                alt="Samsung Logo"
                height="20"
                width="auto"
              />
              <img
                className="h-4 w-fit dark:invert"
                src="https://html.tailus.io/images/clients/github.svg"
                alt="GitHub Logo"
                height="16"
                width="auto"
              />
              <img
                className="h-5 w-fit dark:invert"
                src="https://html.tailus.io/images/clients/lilly.svg"
                alt="Lilly Logo"
                height="20"
                width="auto"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: 'Features', href: '#link' },
  { name: 'Solution', href: '#link' },
  { name: 'Pricing', href: '#link' },
  { name: 'About', href: '#link' },
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
            'mx-auto mt-2 max-w-5xl rounded-2xl border px-6 py-3 transition-all duration-300 lg:px-12',
            isScrolled
              ? 'bg-background/50 backdrop-blur-lg'
              : 'bg-background'
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0">
            <div className="flex w-full items-center justify-between gap-6 lg:w-auto">
              <Link to="/" aria-label="home" className="flex items-center gap-2">
                <Logo />
              </Link>
              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className={cn('m-auto size-6 duration-200', menuState && 'rotate-180 scale-0')} />
                <X className={cn('absolute inset-0 m-auto size-6 duration-200', !menuState && '-rotate-180 scale-0')} />
              </button>
            </div>

            <div className="hidden lg:flex lg:items-center lg:gap-6">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link to={item.href} className="text-muted-foreground hover:text-foreground block duration-150">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn('bg-background mb-6 w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent', menuState ? 'flex' : 'hidden')}>
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link to={item.href} className="text-muted-foreground hover:text-foreground block duration-150">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button variant="outline" size="sm" asChild>
                  <Link to="#">Login</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="#">Sign Up</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="#">
                    <span>Get Started</span>
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
    <svg className={cn('size-7', className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="currentColor" />
      <path d="M8 7L16 12L8 17V7Z" fill="white" className="dark:fill-black" />
    </svg>
  );
};
