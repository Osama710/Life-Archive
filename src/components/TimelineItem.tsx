import { Card } from './Card'

interface TimelineItemProps {
  date: string
  title: string
  thumbnail?: string
  selected?: boolean
  onClick?: () => void
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  date,
  title,
  thumbnail,
  selected = false,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={`mb-4 cursor-pointer hover:shadow-lg ${
        selected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex gap-4">
        {thumbnail && (
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
            <img src={thumbnail} alt={title} className="w-full h-full object-cover rounded-lg" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-500">{date}</p>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
    </Card>
  )
}
