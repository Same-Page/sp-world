import BaseScene from "./Base"

export default class InnScene extends BaseScene {
	initExtra() {
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
		if (this.entrance === "yard") {
			this.setUserPos(this.user, 30, 30)
		} else {
			this.setUserPos(this.user, 6, 50)
		}
	}

	checkPos() {
		// TODO: move to base, setup scene to scene door in map
		// console.log("checkPos")
		const tileX = this.user.x
		const tileY = this.user.y
		if (tileY === 51) {
			this.scene.start("village", {
				user: this.user,
				socket: this.socket,
			})
			console.log(this)
			this.leave()
		}
		if (tileY === 31 && (tileX === 30 || tileX === 31)) {
			this.scene.start("village", {
				user: this.user,
				socket: this.socket,
				entrance: "yard",
			})
			this.leave()
		}
	}
	// update() {
	// 	super.update()
	// 	// console.log("inn")
	// }
}
