import BaseScene from "./Base"

export default class InnScene extends BaseScene {
	init(data) {
		// console.log("inn init", data)
		this.initData = data || {}
	}
	preload() {
		super.preload()

		this.load.image("inn", "tilesets/inn.png")
		this.load.tilemapTiledJSON("inn", "map/inn.json")
	}

	create() {
		// window.leave = this.leave
		// window.leave.bind(this)

		super.create()
		this.sceneName = "inn"

		const map = this.make.tilemap({ key: "inn" })
		this.map = map
		// 1st param is tileset name in map.json, 2nd is image key in cache
		// extruded tile, need to set margin and spacing
		const innTileset = map.addTilesetImage("inn", "inn")
		const tilesets = [innTileset]
		// console.log(map)
		map.layers.forEach((l) => {
			const mapLayer = map.createStaticLayer(l.name, tilesets)
			if (l.name === "wall") {
				mapLayer.depth = 1
			}
		})

		this.postCreate()
		// console.log(this)
		if (this.initData.entrance === "yard") {
			this.user.sprite.x = 30 * this.map.tileHeight
			this.user.sprite.y = 28 * this.map.tileWidth
		} else {
			this.user.sprite.x = 6 * this.map.tileHeight
			this.user.sprite.y = 48 * this.map.tileWidth
		}
	}

	checkPos() {
		// move to base
		// console.log("checkPos")
		const tileX = this.p2t(this.user.sprite.x)
		const tileY = this.p2t(this.user.sprite.y)
		if (tileY === 49) {
			this.scene.start("village", { x: 81, y: 74 })
			this.leave()
		}
		if (tileY === 29 && (tileX === 30 || tileX === 31)) {
			this.scene.start("village", { x: 88, y: 71 })
			this.leave()
		}
	}
	update() {
		super.update()
		// console.log("inn")
	}
}
