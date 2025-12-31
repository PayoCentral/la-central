// components/VoteControl.tsx
'use client'

import { castVote } from '@/app/actions'
import { useTransition } from 'react'

interface VoteControlProps {
  postId: string
  temperature: number
  initialUserVote?: number // Para saber si ya lo voté yo (pintar el botón de color)
}

export default function VoteControl({ postId, temperature, initialUserVote = 0 }: VoteControlProps) {
  const [isPending, startTransition] = useTransition()

  const handleVote = (value: 1 | -1) => {
    startTransition(async () => {
      try {
        await castVote(postId, value)
      } catch (error) {
        alert("Necesitas iniciar sesión para votar")
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-1 border-r pr-4 mr-4">
      {/* Botón Caliente + */}
      <button 
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`p-1 rounded hover:bg-gray-100 transition ${initialUserVote === 1 ? 'text-orange-600 font-bold' : 'text-gray-400'}`}
      >
        🔥
      </button>

      {/* Temperatura */}
      <span className={`font-bold text-lg ${temperature < 0 ? 'text-blue-500' : 'text-orange-600'}`}>
        {temperature}°
      </span>

      {/* Botón Frío - */}
      <button 
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`p-1 rounded hover:bg-gray-100 transition ${initialUserVote === -1 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}
      >
        ❄️
      </button>
    </div>
  )
}