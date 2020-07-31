import React, { useEffect, useState } from "react"
import Phaser from "phaser"
import CircleMaskImagePlugin from "phaser3-rex-plugins/plugins/circlemaskimage-plugin.js"

import GateScene from "./scenes/Gate"

function Game() {
	useEffect(() => {
		console.log("init game")

		const game = new Phaser.Game({
			type: Phaser.AUTO,
			// type: Phaser.CANVAS,
			width: window.innerWidth,
			height: window.innerHeight,
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
			plugins: {
				global: [
					{
						key: "rexCircleMaskImagePlugin",
						plugin: CircleMaskImagePlugin,
						start: true,
					},
					// ...
				],
			},
		})
		game.scene.add("gate", GateScene)
		game.scene.start("gate")
		window.game = game
		window.addEventListener("resize", () => {
			game.scale.resize(window.innerWidth, window.innerHeight)
		})
	}, [])
	return <div id="game"></div>
}

export default Game
