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
	return easyStar
}

const p2t = (p) => {
	const t = Math.floor(p / TILE_WIDTH)
	return t
}
export default class GateScene extends Phaser.Scene {
	preload() {
		this.load.image("cat", "img/cat.jpg")
		// this.load.image("grass", "tilesets/grass.png")
		this.load.image("base", "map/[Base]BaseChip_pipo.png")
		this.load.image("waterfall", "map/[A]WaterFall_pipo.png")
		this.load.image("grass", "map/[A]Grass_pipo.png")
		this.load.image("water", "map/[A]Water_pipo.png")
		this.load.image("flower", "map/[A]Flower_pipo.png")
		// this.load.tilemapTiledJSON("map", "map/map.json")
		this.load.tilemapTiledJSON("map", "map/pipoya.json")
	}
	create() {
		this.add.text(200, 100, "hi there")
		const map = this.make.tilemap({ key: "map" })
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
		const grassTileset = map.addTilesetImage("[A]Grass_pipo", "grass")
		const flowerTileset = map.addTilesetImage("[A]Flower_pipo", "flower")
		const tilesets = [
			baseTileset,
			waterTileset,
			waterfallTileset,
			grassTileset,
			flowerTileset,
		]
		console.log(map)
		map.layers.forEach((l) => {
			const mapLayer = map.createStaticLayer(l.name, tilesets)
			if (["grass", "ground", "bridge", "water"].includes(l.name)) {
				// console.log(mapLayer)
			} else {
				mapLayer.depth = 1
			}
		})

		const user = this.add.sprite(50, 50, "cat")
		console.log(user)
		user.setOrigin(0, 0)
		user.y = 100
		user.displayWidth = 32
		user.displayHeight = 32
		this.cameras.main.roundPixels = true
		// this.cameras.main.setBackgroundColor("#ffffff")

		this.cameras.main.startFollow(user)
		this.cameras.main.setBounds(0, 0, 9999, 9999)

		const easyStar = setupEasyStar(map)
		easyStar.enableDiagonals(true)

		this.input.on("pointerdown", (pointer) => {
			console.log(pointer)
			// user.x = pointer.worldX
			// user.y = pointer.worldY
			const startX = p2t(user.x)
			const startY = p2t(user.y)
			const targetX = p2t(pointer.worldX)
			const targetY = p2t(pointer.worldY)
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
						tweens.push({
							targets: user,
							x: { value: ex * map.tileWidth, duration: 100 },
							y: { value: ey * map.tileHeight, duration: 100 },
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
}
