
import { Link, useLocation } from "wouter";
import { UserCircle, Calendar, BarChart2, LayersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAuthenticated, username, login, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/sections">
              <a className={`flex items-center ${location === "/sections" ? "text-primary" : ""}`}>
                <LayersIcon className="w-4 h-4 mr-2" />
                Sections
              </a>
            </Link>
            <Link href="/students">
              <a className={`flex items-center ${location === "/students" ? "text-primary" : ""}`}>
                <UserCircle className="w-4 h-4 mr-2" />
                Students
              </a>
            </Link>
            <Link href="/attendance">
              <a className={`flex items-center ${location === "/attendance" ? "text-primary" : ""}`}>
                <Calendar className="w-4 h-4 mr-2" />
                Attendance
              </a>
            </Link>
            <Link href="/reports">
              <a className={`flex items-center ${location === "/reports" ? "text-primary" : ""}`}>
                <BarChart2 className="w-4 h-4 mr-2" />
                Reports
              </a>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {username}</span>
                <Button variant="outline" onClick={logout}>Logout</Button>
              </>
            ) : (
              <Button onClick={login}>Login</Button>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
