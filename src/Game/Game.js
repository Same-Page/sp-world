import React, { useEffect, useState } from "react"
import Phaser from "phaser"

import GateScene from "./scenes/Gate"

function Game() {
	useEffect(() => {
		console.log("init game")

		const game = new Phaser.Game({
			type: Phaser.AUTO,
			// type: Phaser.CANVAS,
			width: 800,
			height: 600,
			// physics: {
			// 	default: 'arcade',
			// 	arcade: {
			// 		gravity: { y: 200 }
			// 	}
			// },
			// scene: {
			// 	// preload: preload,
			// 	// create: create
			// },
		})
		game.scene.add("gate", GateScene)
		game.scene.start("gate")
		window.game = game
	}, [])
	return <div id="game"></div>
}

export default Game
