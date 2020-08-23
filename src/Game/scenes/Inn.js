import BaseScene from "./Base"

export default class InnScene extends BaseScene {
	init(data) {
		// console.log("inn init", data)
		this.initData = data || {}
		this.sceneName = "inn"
	}
	preloadExtra() {
		this.load.image("inn", "tilesets/inn.png")
		this.load.tilemapTiledJSON("inn", "map/inn.json")
	}

	createMap() {
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

		// console.log(this)
	}
	postCreate() {
		if (this.initData.entrance === "yard") {
			this.setUserPos(this.user, 30, 30)
		} else {
			this.setUserPos(this.user, 6, 50)
		}
	}

	checkPos() {
		// move to base
		// console.log("checkPos")
		const tileX = this.p2t(this.user.sprite.x)
		const tileY = this.p2t(this.user.sprite.y)
		if (tileY === 51) {
			this.scene.start("village", { x: 81, y: 74 })
			this.leave()
		}
		if (tileY === 31 && (tileX === 30 || tileX === 31)) {
			this.scene.start("village", { x: 88, y: 71 })
			this.leave()
		}
	}
	// update() {
	// 	super.update()
	// 	// console.log("inn")
	// }
}
