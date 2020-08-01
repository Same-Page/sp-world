import Phaser from "phaser"
import EasyStar from "easystarjs"

const TILE_WIDTH = 32

const checkMapLayerProperty = (layer, name, val) => {
	// console.log(layer.name)
	let res = false
	layer.properties.forEach((p) => {
		if (p.name === name && p.value === val) {
			res = true
		}
	})
	return res
}

const setupEasyStar = (map) => {
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
					if (checkMapLayerProperty(l, "collide", true)) {
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
	return easyStar
}

const p2t = (p) => {
	const t = Math.floor(p / TILE_WIDTH)
	return t
}
export default class GateScene extends Phaser.Scene {
	preload() {
		this.load.setCORS(true)
		this.load.image("whiteSquare", "img/white_square.png")
		this.load.image("redSquare", "img/red_square.png")

		this.load.image(
			"cat",
			"https://avatars2.githubusercontent.com/u/164476?s=88&v=4"
		)
		// this.load.image(
		// 	"cat",
		// 	"https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/assets/images/rectangle128x96.jpg"
		// )
		// this.load.image("grass", "tilesets/grass.png")
		this.load.image("base", "map/[Base]BaseChip_pipo_ex.png")
		this.load.image("waterfall", "map/[A]WaterFall_pipo.png")
		this.load.image("grass", "map/[A]Grass_pipo_ex.png")
		this.load.image("water", "map/[A]Water_pipo.png")
		this.load.image("flower", "map/[A]Flower_pipo.png")
		this.load.image("quest", "map/quest.png")

		this.load.tilemapTiledJSON("map", "map/pipoya.json")
	}
	create() {
		this.add.text(200, 100, "hi there")
		const map = this.make.tilemap({ key: "map" })
		this.map = map

		// 1st param is tileset name in map.json, 2nd is image key in cache

		// extruded tile, need to set margin and spacing
		// https://github.com/sporadic-labs/tile-extruder
		const baseTileset = map.addTilesetImage(
			"[Base]BaseChip_pipo",
			"base",
			32,
			32,
			1,
			2
		)
		const waterfallTileset = map.addTilesetImage(
			"[A]WaterFall_pipo",
			"waterfall"
		)
		const waterTileset = map.addTilesetImage("[A]Water_pipo", "water")
		const grassTileset = map.addTilesetImage(
			"[A]Grass_pipo",
			"grass",
			32,
			32,
			1,
			2
		)
		const flowerTileset = map.addTilesetImage("[A]Flower_pipo", "flower")
		const questTileset = map.addTilesetImage("quest", "quest")
		const tilesets = [
			baseTileset,
			waterTileset,
			waterfallTileset,
			grassTileset,
			flowerTileset,
			questTileset,
		]
		console.log(map)
		map.layers.forEach((l) => {
			const mapLayer = map.createStaticLayer(l.name, tilesets)
			if (
				[
					"grass",
					"ground",
					"bridge",
					"water",
					"water_grass",
					"farm_up",
				].includes(l.name)
			) {
				// console.log(mapLayer)
			} else {
				mapLayer.depth = 1
			}
		})
		this.whiteSquare = this.add.sprite(1500, 1000, "whiteSquare")
		this.redSquare = this.add.sprite(1500, 1000, "redSquare")
		this.whiteSquare.setOrigin(0, 0)
		this.whiteSquare.setAlpha(0.5)
		this.whiteSquare.depth = 9999
		this.redSquare.setOrigin(0, 0)
		this.redSquare.depth = 9999
		this.redSquare.setAlpha(0.5)

		this.input.setDefaultCursor("pointer")
		// const user = this.add.sprite(50, 50, "cat")
		const user = this.add.rexCircleMaskImage(1800, 2700, "cat")
		user.setInteractive({
			cursor: "pointer",
		})
		console.log(user)
		// user.width = 32
		// user.height = 32
		user.setOrigin(0.1, 0)
		// user.y = 100
		user.displayWidth = 40
		user.displayHeight = 32
		this.cameras.main.roundPixels = true
		// this.cameras.main.setBackgroundColor("#ffffff")

		this.cameras.main.startFollow(user)
		this.cameras.main.setBounds(
			0,
			0,
			map.width * map.tileWidth,
			map.height * map.tileHeight
		)

		const easyStar = setupEasyStar(map)
		easyStar.enableDiagonals(true)
		// when camera moves activePointer is not updated
		this.input.setPollAlways()
		this.input.on("pointerdown", (pointer) => {
			console.log(pointer)
			// user.x = pointer.worldX
			// user.y = pointer.worldY
			const startX = p2t(user.x)
			const startY = p2t(user.y)
			const targetX = p2t(pointer.worldX)
			const targetY = p2t(pointer.worldY)
			if (targetY >= map.height || targetX >= map.width) {
				console.warn("out of bound")
				return
			}
			console.log(startX, startY, targetX, targetY)
			easyStar.findPath(startX, startY, targetX, targetY, (path) => {
				// destory previous timeline
				if (user.timeline) {
					user.timeline.destroy()
				}
				console.log(path)
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
						})
					}

					user.timeline = this.tweens.timeline({
						tweens: tweens,
					})

					// var x_steps = []
					// var y_steps = []
					// for (var q = 0; q < path.length; q++) {
					// 	// x_steps.push(path[q].x * Game.map.tileWidth - 16)
					// 	// y_steps.push(path[q].y * Game.map.tileWidth - 32)
					// 	x_steps.push(path[q].x * map.tileWidth)
					// 	y_steps.push(path[q].y * map.tileWidth)
					// }

					// this.tweens.add({
					// 	targets: user,
					// 	x: x_steps,
					// 	y: y_steps,
					// 	duration: 1 * 1000,
					// 	// ease: "Power1",
					// })
				}
			})
			easyStar.calculate()
		})
	}

	update() {
		const tileX = p2t(this.input.activePointer.worldX)
		const tileY = p2t(this.input.activePointer.worldY)

		const collide = this.map.collisionArray[tileY][tileX]
		const x = tileX * TILE_WIDTH
		const y = tileY * TILE_WIDTH
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
