import Phaser from "phaser"
import EasyStar from "easystarjs"

export default class VillageScene extends Phaser.Scene {
	checkMapLayerProperty(layer, name, val) {
		// console.log(layer.name)
		let res = false
		layer.properties.forEach((p) => {
			if (p.name === name && p.value === val) {
				res = true
			}
		})
		return res
	}

	setupEasyStar() {
		const map = this.map
		const easyStar = new EasyStar.js()
		const collisionArray = []
		for (let y = 0; y < map.height; y++) {
			const row = []

			for (let x = 0; x < map.width; x++) {
				let collide = false
				let bridge = false
				map.layers.forEach((l) => {
					map.setLayer(l.name)
					const tile = map.getTileAt(x, y)

					if (tile) {
						if (this.checkMapLayerProperty(l, "collide", true)) {
							collide = true
							// console.log(l.name)
							// console.log(x, y)
						}
						if (tile.properties.bridge) {
							bridge = true
						}
						if (tile.properties.c) {
							collide = true
						}
					}
				})
				if (bridge) {
					collide = false
				}
				row.push(+collide) // "+" to convert boolean to int
			}
			collisionArray.push(row)
		}
		easyStar.setGrid(collisionArray)
		easyStar.setAcceptableTiles([0])
		map.collisionArray = collisionArray
		this.easyStar = easyStar
		easyStar.enableDiagonals(true)

		return easyStar
	}

	p2t(p) {
		const t = Math.floor(p / this.map.tileWidth)
		return t
	}
	checkPos() {}

	preload() {
		console.log("base preload")
		this.load.setCORS(true)
		this.load.image("whiteSquare", "img/white_square.png")
		this.load.image("redSquare", "img/red_square.png")
		this.load.image(
			"cat",
			"https://avatars2.githubusercontent.com/u/164476?s=88&v=4"
		)
	}
	isOutOfBound(x, y) {
		// input is tile index
		if (x < this.map.height && y < this.map.width && x >= 0 && y >= 0) {
			return false
		}
		console.warn("out of bound")
		// this.scene.start("village")
		return true
	}
	postCreate() {
		// after child class pass in map

		const user = this.add.rexCircleMaskImage(100, 200, "cat")
		this.user = user
		user.setInteractive({
			cursor: "pointer",
		})

		user.setOrigin(0.1, 0)

		user.displayWidth = 40
		user.displayHeight = 32
		this.cameras.main.roundPixels = true

		this.cameras.main.startFollow(
			user,
			false,
			1,
			1,
			0,
			window.isMobile ? Math.floor(window.innerHeight / 4) : 0
		)

		const map = this.map

		this.cameras.main.setBounds(
			0,
			0,
			map.width * map.tileWidth,
			map.height * map.tileHeight
		)

		const easyStar = this.setupEasyStar()
		// when camera moves activePointer is not updated
		this.input.setPollAlways()
		this.input.on("pointerdown", (pointer) => {
			// console.log(pointer)
			// user.x = pointer.worldX
			// user.y = pointer.worldY
			const startX = this.p2t(user.x)
			const startY = this.p2t(user.y)
			const targetX = this.p2t(pointer.worldX)
			const targetY = this.p2t(pointer.worldY)
			if (this.isOutOfBound(targetX, targetY)) {
				return
			}

			// console.log(startX, startY, targetX, targetY)
			easyStar.findPath(startX, startY, targetX, targetY, (path) => {
				// destory previous timeline
				if (user.timeline) {
					user.timeline.destroy()
				}
				// console.log(path)
				if (path && path.length) {
					const tweens = []
					for (var i = 0; i < path.length - 1; i++) {
						var ex = path[i + 1].x
						var ey = path[i + 1].y
						// if walking diagonally, duration should be longer
						// because distance is longer
						let duration = 100
						if (ex !== path[i].x && ey !== path[i].y) {
							duration = 150
						}
						tweens.push({
							targets: user,
							x: {
								value: ex * map.tileWidth,
								duration: duration,
							},
							y: {
								value: ey * map.tileHeight,
								duration: duration,
							},
							// onUpdate: (tween, target) => {
							// 	console.log(target.x, target.y)
							// 	this.checkPos(
							// 		this.p2t(target.x),
							// 		this.p2t(target.y)
							// 	)
							// },
						})
					}

					user.timeline = this.tweens.timeline({
						tweens: tweens,
						onUpdate: (t) => {
							this.checkPos()
							// console.log(a, b, c)
						},
					})
				}
			})
			easyStar.calculate()
		})
	}
	create() {
		console.log("base create")

		this.whiteSquare = this.add.sprite(0, 0, "whiteSquare")
		this.redSquare = this.add.sprite(0, 0, "redSquare")
		this.whiteSquare.setOrigin(0, 0)
		this.whiteSquare.setAlpha(0.5)
		this.whiteSquare.depth = 9999
		this.redSquare.setOrigin(0, 0)
		this.redSquare.depth = 9999
		this.redSquare.setAlpha(0.5)

		this.input.setDefaultCursor("pointer")
		// const user = this.add.sprite(50, 50, "cat")
	}

	update() {
		const tileX = this.p2t(this.input.activePointer.worldX)
		const tileY = this.p2t(this.input.activePointer.worldY)
		if (this.isOutOfBound(tileX, tileY)) {
			return
		}
		// console.log(this.map, tileY, tileX)
		const collide = this.map.collisionArray[tileY][tileX]
		const x = tileX * this.map.tileWidth
		const y = tileY * this.map.tileWidth
		if (collide) {
			this.redSquare.x = x
			this.redSquare.y = y
			this.redSquare.setVisible(true)
			this.whiteSquare.setVisible(false)
		} else {
			this.whiteSquare.x = x
			this.whiteSquare.y = y
			this.redSquare.setVisible(false)
			this.whiteSquare.setVisible(true)
		}
		// console.log(collide)
		// console.log(this.input.worldX)
	}
}
