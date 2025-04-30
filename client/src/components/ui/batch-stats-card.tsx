import { cn } from "@/lib/utils";

interface BatchStatsCardProps {
  totalBatches: number;
  completedBatches: number;
  partiallyCompletedBatches: number;
  notStartedBatches: number;
  completionPercentage: number;
}

export function BatchStatsCard({
  totalBatches,
  completedBatches,
  partiallyCompletedBatches,
  notStartedBatches,
  completionPercentage
}: BatchStatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-800">Batch Status</h3>
          <p className="text-sm text-gray-500">Översikt av alla batches</p>
        </div>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-md flex items-center justify-center bg-primary-100">
            <span className="material-icons text-primary">inventory_2</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-500">Totalt</h3>
            <p className="text-2xl font-semibold text-gray-900">{totalBatches}</p>
          </div>
        </div>
      </div>
      
      <div className="relative pt-1 mb-4">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
          <div 
            style={{ width: `${completionPercentage}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">{completionPercentage}% klart</div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 rounded-md bg-green-50 flex flex-col items-center">
          <span className="material-icons text-green-600 mb-1">check_circle</span>
          <span className="text-lg font-semibold text-gray-800">{completedBatches}</span>
          <span className="text-xs text-gray-500">Inventerade</span>
        </div>
        
        <div className="p-3 rounded-md bg-blue-50 flex flex-col items-center">
          <span className="material-icons text-blue-600 mb-1">indeterminate_check_box</span>
          <span className="text-lg font-semibold text-gray-800">{partiallyCompletedBatches}</span>
          <span className="text-xs text-gray-500">Delvis</span>
        </div>
        
        <div className="p-3 rounded-md bg-red-50 flex flex-col items-center">
          <span className="material-icons text-red-600 mb-1">pending_actions</span>
          <span className="text-lg font-semibold text-gray-800">{notStartedBatches}</span>
          <span className="text-xs text-gray-500">Ej påbörjade</span>
        </div>
      </div>
    </div>
  );
}