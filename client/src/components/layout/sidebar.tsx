import { Link, useLocation } from "wouter";
import { useUser } from "@/context/user-context";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useUser();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-semibold text-primary">Batchinventering</h1>
      </div>
      
      <nav className="mt-6 px-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Huvudmeny
        </div>
        
        <Link href="/">
          <div className={cn(
            "flex items-center px-4 py-2.5 text-sm font-medium rounded-md cursor-pointer",
            isActive("/") 
              ? "bg-primary-50 text-primary-700" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}>
            <span className="material-icons text-primary-500 mr-3 text-lg">inventory_2</span>
            Aktuell inventering
          </div>
        </Link>
        
        <Link href="/history">
          <div className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mt-1 cursor-pointer">
            <span className="material-icons text-gray-500 mr-3 text-lg">history</span>
            Inventeringshistorik
          </div>
        </Link>
        
        <Link href="/import">
          <div className={cn(
            "flex items-center px-4 py-2.5 text-sm font-medium rounded-md mt-1 cursor-pointer",
            isActive("/import") 
              ? "bg-primary-50 text-primary-700" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}>
            <span className="material-icons text-gray-500 mr-3 text-lg">upload_file</span>
            Importera data
          </div>
        </Link>
        
        <Link href="/export">
          <div className={cn(
            "flex items-center px-4 py-2.5 text-sm font-medium rounded-md mt-1 cursor-pointer",
            isActive("/export") 
              ? "bg-primary-50 text-primary-700" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}>
            <span className="material-icons text-gray-500 mr-3 text-lg">download</span>
            Exportera resultat
          </div>
        </Link>
        
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8">
          Inställningar
        </div>
        
        <Link href="/settings">
          <div className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer">
            <span className="material-icons text-gray-500 mr-3 text-lg">settings</span>
            Inställningar
          </div>
        </Link>
        
        <Link href="/help">
          <div className="flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 mt-1 cursor-pointer">
            <span className="material-icons text-gray-500 mr-3 text-lg">help_outline</span>
            Hjälp
          </div>
        </Link>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "AN"}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name || "Anonym Användare"}</p>
            <p className="text-xs text-gray-500">{user?.role || "Användare"}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-500 md:hidden">
            <span className="material-icons text-lg">close</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
