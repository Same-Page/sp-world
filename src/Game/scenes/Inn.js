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
			this.user.x = 30 * this.map.tileHeight
			this.user.y = 28 * this.map.tileWidth
		} else {
			this.user.x = 6 * this.map.tileHeight
			this.user.y = 48 * this.map.tileWidth
		}
	}
	checkPos() {
		// move to base
		const tileX = this.p2t(this.user.x)
		const tileY = this.p2t(this.user.y)
		if (tileY === 49) {
			this.scene.start("village", { x: 81, y: 74 })
		}
		if (tileY === 29 && (tileX === 30 || tileX === 31)) {
			this.scene.start("village", { x: 88, y: 71 })
		}
		const room = this.checkInRoom(this.user.x, this.user.y)
		if (room) {
			if (!this.user.room) {
				console.log("enter", room)
				window.setShowRoomInfo(true)
			}
			this.user.room = room
		} else {
			if (this.user.room) {
				console.log("leave", this.user.room)
				this.user.room = null
			}
		}
	}
	update() {
		super.update()
		// console.log("inn")
	}
}