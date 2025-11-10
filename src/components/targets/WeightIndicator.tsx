'use client'

interface WeightIndicatorProps {
  totalWeight: number
}

export function WeightIndicator({ totalWeight }: WeightIndicatorProps) {
  const isValid = totalWeight === 100
  const isOverweight = totalWeight > 100
  const isUnderweight = totalWeight < 100

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Total Weight
        </div>
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isValid
                ? 'bg-green-500'
                : isOverweight
                ? 'bg-red-500'
                : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
      </div>
      <div className="text-center">
        <div
          className={`text-3xl font-bold ${
            isValid
              ? 'text-green-600'
              : isOverweight
              ? 'text-red-600'
              : 'text-yellow-600'
          }`}
        >
          {totalWeight}%
        </div>
        <div className="text-xs text-gray-500">of 100%</div>
      </div>
      {!isValid && (
        <div className="ml-2">
          {isOverweight ? (
            <div className="text-xs text-red-600 font-medium">
              ⚠️ Over by {totalWeight - 100}%
            </div>
          ) : (
            <div className="text-xs text-yellow-600 font-medium">
              ⚠️ Under by {100 - totalWeight}%
            </div>
          )}
        </div>
      )}
    </div>
  )
}
