"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navGroups = [
  {
    section: "Operação",
    items: [
      { href: "/", label: "Monitoramento" },
      { href: "/ordens", label: "Ordens de Venda" },
      { href: "/agendamento", label: "Central de Agendamento" },
    ],
  },
  {
    section: "Cadastros",
    items: [
      { href: "/cadastros/clientes", label: "Clientes" },
      { href: "/cadastros/transportes", label: "Tipos de Transporte" },
      { href: "/cadastros/itens", label: "Itens" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 px-4 py-6 md:flex">
        <div className="mb-8 px-2">
          <span className="text-lg font-semibold text-white">OVGS</span>
          <p className="text-xs text-slate-400">Gestão de Ordens de Venda</p>
        </div>
        <nav className="flex flex-col gap-6">
          {navGroups.map((group) => (
            <div key={group.section}>
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {group.section}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm transition",
                        isActive(pathname, item.href)
                          ? "bg-slate-800 text-white"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-slate-200 bg-white px-6">
          <span className="text-sm font-semibold text-slate-700 md:hidden">
            OVGS
          </span>
          <span className="ml-auto text-sm text-slate-400">
            Sistema de Gestão de Ordens de Venda
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
