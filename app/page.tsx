'use client'
import dynamic from 'next/dynamic'

const PhaserGame = dynamic(() => import('../components/PhaserGame'), {
  ssr: false,
  loading: () => <p>Loading game..ok ok.</p>
})

export default function Home() {
  return (
    <main className="game-container">
      <div className="game-wrapper">
        <h1>Phaser + Next.js Demo</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Use arrow keys to move and jump. Collect yellow stars to increase your score!
        </p>
        <PhaserGame />
       
      </div>
    </main>
  )
}
