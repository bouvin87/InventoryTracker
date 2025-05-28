import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Overlay för att stänga menyn när man klickar utanför */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 border-b px-4">
          <h1 className="text-xl font-semibold text-primary">Batchinventering</h1>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <span className="material-icons text-lg">close</span>
          </button>
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
          <div className={cn(
            "flex items-center px-4 py-2.5 text-sm font-medium rounded-md cursor-pointer",
            isActive("/settings") 
              ? "bg-primary-50 text-primary-700" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}>
            <span className="material-icons text-gray-500 mr-3 text-lg">settings</span>
            Inställningar
          </div>
        </Link>
        
        <Link href="/help">
          <div className={cn(
            "flex items-center px-4 py-2.5 text-sm font-medium rounded-md mt-1 cursor-pointer",
            isActive("/help") 
              ? "bg-primary-50 text-primary-700" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}>
            <span className="material-icons text-gray-500 mr-3 text-lg">help_outline</span>
            Hjälp
          </div>
        </Link>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t">
        <div className="flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-gray-500">
              {user ? `Inloggad som ${user.name}` : 'Ej inloggad'}
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
