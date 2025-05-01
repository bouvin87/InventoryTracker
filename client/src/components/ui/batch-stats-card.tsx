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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-full">
      <div className="flex items-center mb-6">
        <div className="w-14 h-14 rounded-md flex items-center justify-center bg-primary-100">
          <span className="material-icons text-primary text-2xl">inventory_2</span>
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold text-gray-800">Batchstatistik</h3>
          <p className="text-sm text-gray-500">Översikt av alla batches</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{totalBatches}</div>
          <div className="text-sm text-gray-500 mt-1">Totalt</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{completedBatches}</div>
          <div className="text-sm text-gray-500 mt-1">Inventerade</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{partiallyCompletedBatches}</div>
          <div className="text-sm text-gray-500 mt-1">Delvis</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{notStartedBatches}</div>
          <div className="text-sm text-gray-500 mt-1">Ej påbörjade</div>
        </div>
      </div>
      
      <div className="relative pt-1">
        <div className="flex justify-between mb-1">
          <div className="text-xs font-semibold text-gray-600">Genomförande</div>
          <div className="text-xs font-semibold text-gray-600">{completionPercentage}%</div>
        </div>
        <div className="overflow-hidden h-3 text-xs flex rounded bg-gray-100">
          <div 
            style={{ width: `${completionPercentage}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
          ></div>
        </div>
      </div>
    </div>
  );
}