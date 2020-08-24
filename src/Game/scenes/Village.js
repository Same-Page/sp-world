import Phaser from "phaser"
import BaseScene from "./Base"

export default class VillageScene extends BaseScene {
	init(data) {
		console.log("init village")
		this.sceneName = "village"

		if (data) {
			this.startPos = {
				x: data.x,
				y: data.y,
			}
		} else {
			this.startPos = { x: 56, y: 88 }
		}
	}

	preloadExtra() {
		this.load.image("base", "map/[Base]BaseChip_pipo_ex.png")
		this.load.image("waterfall", "map/[A]WaterFall_pipo.png")
		this.load.image("grass", "map/[A]Grass_pipo_ex.png")
		this.load.image("water", "map/[A]Water_pipo.png")
		this.load.image("flower", "map/[A]Flower_pipo.png")
		this.load.image("quest", "map/quest.png")

		this.load.tilemapTiledJSON("map", "map/pipoya.json")
	}
	createMap() {
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
		// console.log(map)
		map.layers.forEach((l) => {
			const mapLayer = map.createStaticLayer(l.name, tilesets)
			if (
				[
					"grass",
					"ground",
					"bridge",
					"water",
					"water_grass",
					"ground_up",
					"terrain",
					"building",
				].includes(l.name)
			) {
				// layers below user
				// console.log(mapLayer)
			} else {
				// layers above user
				mapLayer.depth = 1
			}
		})
	}
	postCreate() {
		this.setUserPos(this.user, this.startPos.x, this.startPos.y)

		// this.user.sprite.x = this.startPos.x * this.map.tileHeight
		// this.user.sprite.y = this.startPos.y * this.map.tileHeight
		// if (this.initData.entrance === "yard") {
		// 	this.setUserPos(this.user, 30, 30)
		// } else {
		// 	this.setUserPos(this.user, 6, 50)
		// }
	}
	checkPos() {
		const tileX = this.user.x
		const tileY = this.user.y
		// console.log(tileX, tileY)
		if (tileX === 81 && tileY === 73) {
			console.log("enter inn")
			this.scene.start("inn", {})
			this.leave()
		}
		if (tileX === 88 && tileY === 70) {
			console.log("enter inn from yard")
			this.scene.start("inn", { entrance: "yard" })
			this.leave()
		}
	}

	// update() {
	// 	super.update()
	// 	// console.log("v")
	// }
}
