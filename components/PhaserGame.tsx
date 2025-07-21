'use client'

import { forwardRef, useLayoutEffect, useRef, useState } from 'react'

const PhaserGame = () => {
  const gameRef = useRef<HTMLDivElement>(null)
  const phaserGameRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useLayoutEffect(() => {
    let mounted = true

    const initializeGame = async () => {
      try {
        // Check if window is available
        if (typeof window === 'undefined') {
          console.log("Window not available yet")
          return
        }

        // Check if game is already initialized
        if (phaserGameRef.current) {
          console.log("Phaser game already initialized")
          return
        }

        // gameRef should be available now with useLayoutEffect
        if (!gameRef.current) {
          console.error("gameRef is still null even with useLayoutEffect")
          setError('Failed to initialize game container')
          setIsLoading(false)
          return
        }

        console.log("Starting Phaser initialization with gameRef:", gameRef.current)

        // Dynamic import of Phaser
        const Phaser = await import('phaser')
        if (!mounted) return

        // Game variables
        let player: any
        let platforms: any
        let cursors: any
        let stars: any
        let score = 0
        let scoreText: any

        const preload = function(this: any) {
          // Create colored rectangles as sprites
          this.add.graphics()
            .fillStyle(0x00ff00)
            .fillRect(0, 0, 32, 32)
            .generateTexture('ground', 32, 32)

          this.add.graphics()
            .fillStyle(0xff0000)
            .fillRect(0, 0, 32, 48)
            .generateTexture('dude', 32, 48)

          this.add.graphics()
            .fillStyle(0xffff00)
            .fillRect(0, 0, 24, 24)
            .generateTexture('star', 24, 24)
        }

        const create = function(this: any) {
          // Create platforms
          platforms = this.physics.add.staticGroup()
          
          // Ground
          platforms.create(400, 568, 'ground').setScale(25, 2).refreshBody()
          
          // Platforms
          platforms.create(600, 400, 'ground').setScale(6, 1).refreshBody()
          platforms.create(50, 250, 'ground').setScale(6, 1).refreshBody()
          platforms.create(750, 220, 'ground').setScale(6, 1).refreshBody()

          // Player
          player = this.physics.add.sprite(100, 450, 'dude')
          player.setBounce(0.2)
          player.setCollideWorldBounds(true)

          // Player physics
          this.physics.add.collider(player, platforms)

          // Create stars
          stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
          })

          stars.children.entries.forEach((child: any) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
          })

          this.physics.add.collider(stars, platforms)
          this.physics.add.overlap(player, stars, collectStar, undefined, this)

          // Score text
          scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '32px', 
            color: '#000' 
          })

          // Cursor keys
          cursors = this.input.keyboard!.createCursorKeys()
        }

        const update = function(this: any) {
          if (cursors.left.isDown) {
            player.setVelocityX(-160)
          } else if (cursors.right.isDown) {
            player.setVelocityX(160)
          } else {
            player.setVelocityX(0)
          }

          if (cursors.up.isDown && player.body!.touching.down) {
            player.setVelocityY(-330)
          }
        }

        const collectStar = function(player: any, star: any) {
          star.disableBody(true, true)

          score += 10
          scoreText.setText('Score: ' + score)

          if (stars.countActive(true) === 0) {
            stars.children.entries.forEach((child: any) => {
              child.enableBody(true, child.x, 0, true, true)
            })
          }
        }

        // Phaser game configuration
        const config = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: gameRef.current,
          backgroundColor: '#2c3e50',
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 300, x: 0 },
              debug: false
            }
          },
          scene: {
            preload: preload,
            create: create,
            update: update
          }
        }

        // Create the game instance
        phaserGameRef.current = new Phaser.Game(config)
        console.log("Phaser game created successfully")
        setIsLoading(false)
        
      } catch (err) {
        console.error('Failed to initialize Phaser game:', err)
        setError('Failed to load game')
        setIsLoading(false)
      }
    }

    initializeGame()

    // Cleanup function
    return () => {
      mounted = false
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true)
        phaserGameRef.current = null
      }
    }
  }, [])

  if (error) {
    return (
      <div style={{ 
        width: '800px', 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        border: '1px solid #ccc',
        backgroundColor: '#f0f0f0'
      }}>
        Error: {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div ref={gameRef} style={{ 
        width: '800px', 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        border: '1px solid #ccc',
        backgroundColor: '#ff0000'
      }}>
      </div>
    )
  }

  return (
    <div 
      ref={gameRef} 
      style={{ 
        width: '800px', 
        height: '600px',
        border: '2px solid #333',
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  )
}

export default PhaserGame
