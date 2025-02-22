import { Link, useLocation } from "wouter";
import { UserCircle, Calendar, BarChart2, LayersIcon } from "lucide-react";

const navItems = [
  { href: "/sections", label: "Sections", icon: LayersIcon },
  { href: "/students", label: "Students", icon: UserCircle },
  { href: "/attendance", label: "Attendance", icon: Calendar },
  { href: "/reports", label: "Reports", icon: BarChart2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="font-bold">Attendance Tracker</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4 ml-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    location === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main className="container mx-auto pt-20 px-4">{children}</main>
    </div>
  );
}