import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

export function MainNav() {
  const { isAuthenticated, username, login, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4">
      {/* ... other navigation items ... */}
      <div className="ml-auto flex items-center gap-4">
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
  );
}