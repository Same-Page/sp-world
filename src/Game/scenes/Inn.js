import Phaser from "phaser"
import BaseScene from "./Base"

export default class InnScene extends BaseScene {
	init() {
		this.left = false
	}
	preload() {
		super.preload()

		this.load.image("inn", "tilesets/inn.png")
		this.load.tilemapTiledJSON("inn", "map/inn.json")
	}
	leave() {
		if (this.left) {
			return
		}
		console.log(this)
		this.scene.remove("inn")
		this.scene.start("village")
		this.left = true
	}
	create() {
		// window.leave = this.leave
		// window.leave.bind(this)

		super.create()
		this.add.text(200, 100, "hi there")
		const map = this.make.tilemap({ key: "inn" })
		this.map = map
		// 1st param is tileset name in map.json, 2nd is image key in cache
		// extruded tile, need to set margin and spacing
		const innTileset = map.addTilesetImage("inn", "inn")
		const tilesets = [innTileset]
		console.log(map)
		map.layers.forEach((l) => {
			const mapLayer = map.createStaticLayer(l.name, tilesets)
		})
		super.postCreate()
	}
	checkPos() {
		const tileX = this.p2t(this.user.x)
		const tileY = this.p2t(this.user.y)
		if (tileX === 10) {
			this.scene.start("village", { x: 81, y: 74 })
			// this.leave()
		}
	}
	update() {
		super.update()
		console.log("inn")
	}
}
