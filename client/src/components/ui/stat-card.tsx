import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: string;
  iconColor: string;
  backgroundColor: string;
  title: string;
  value: string | number;
  progressValue?: number;
  progressText?: string;
}

export function StatCard({
  icon,
  iconColor,
  backgroundColor,
  title,
  value,
  progressValue,
  progressText
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 h-full">
      <div className="flex items-center mb-3">
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center",
          backgroundColor
        )}>
          <span className={cn("material-icons text-xl", iconColor)}>{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      
      {progressValue !== undefined && progressText && (
        <div className="mt-4">
          <div className="relative pt-1">
            <div className="flex justify-between mb-1">
              <div className="text-xs font-semibold text-gray-600">Genomförande</div>
              <div className="text-xs font-semibold text-gray-600">{progressValue}%</div>
            </div>
            <div className="overflow-hidden h-3 mb-1 text-xs flex rounded bg-gray-100">
              <div 
                style={{ width: `${progressValue}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              ></div>
            </div>
            <div className="text-xs text-gray-500">{progressText}</div>
          </div>
        </div>
      )}
    </div>
  );
}
