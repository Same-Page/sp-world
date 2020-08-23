import Phaser from "phaser"
import EasyStar from "easystarjs"
import io from "socket.io-client"
export default class BaseScene extends Phaser.Scene {
	preload() {
		// const userId = new Date().getTime() % 1000
		// this.userId = userId
		// console.log("base preload")
		this.load.setCORS(true)
		this.load.image("whiteSquare", "img/white_square.png")
		this.load.image("redSquare", "img/red_square.png")
		this.load.image("questionMark", "/img/question_mark.png")
		// this.load.image(
		// 	"user-avatar-" + userId,
		// 	"/img/avatars/" + (userId % 20) + ".png"
		// )
		this.preloadExtra()
	}
	preloadExtra() {}

	createMap() {}

	create() {
		window.scene = this
		this.sceneName = "base"

		this.setupCursor()

		this.createMap()
		this.users = {}
		const userId = new Date().getTime() % 1000

		const user = this.addUser({
			id: userId,
			x: 0,
			y: 0,
		})
		user.name = userId
		this.user = user
		window.user = user
		this.setupRooms()
		this.setupNPC()
		this.setupEasyStar()

		this.setupCamera(user.sprite)

		this.setupInput(user)
		this.setupSocket(user)
		this.postCreate()
	}

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
	setupCursor() {
		this.whiteSquare = this.add.sprite(0, 0, "whiteSquare")
		this.redSquare = this.add.sprite(0, 0, "redSquare")
		this.whiteSquare.setOrigin(0, 0)
		this.whiteSquare.setAlpha(0.5)
		this.whiteSquare.depth = 9999
		this.redSquare.setOrigin(0, 0)
		this.redSquare.depth = 9999
		this.redSquare.setAlpha(0.5)
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
		easyStar.disableCornerCutting(true)
		return easyStar
	}

	p2t(p) {
		const t = Math.floor(p / this.map.tileWidth)
		return t
	}
	checkPos() {}

	isOutOfBound(x, y) {
		// input is tile index
		// console.log(x, y, this.map.height)
		if (x < this.map.width && y < this.map.height && x >= 0 && y >= 0) {
			return false
		}

		console.warn("out of bound")
		// this.scene.start("village")
		return true
	}

	setOccupiedRooms(rooms) {
		this.occupiedRooms = rooms
		this.rooms.forEach((r) => {
			const occupiedRoom = rooms[r.name]
			r.infoBg.visible = true

			if (occupiedRoom) {
				r.infoBg.visible = true
				r.infoText.visible = true
				r.infoText.setText(occupiedRoom.name)
			} else {
				r.infoBg.visible = false
				r.infoText.visible = false
			}
		})
	}
	roomUpdateListener(room) {
		this.occupiedRooms[room.id] = room
		this.setOccupiedRooms(this.occupiedRooms)
		window.showRoomModal({ id: room.id, data: room })
	}
	otherEnterRoomListner(user) {
		console.log("other enters", user)
		if (window.enterRoomListener) {
			window.enterRoomListener(user)
		} else {
			console.error("enterRoomListener not defined")
		}
	}
	setupRooms() {
		this.rooms = []
		this.occupiedRooms = {}
		const map = this.map
		map.objects.forEach((ol) => {
			if (ol.name === "room") {
				ol.objects.forEach((r) => {
					r.id = r.name
					r.points = [
						[r.x, r.y],
						[r.x + r.width, r.y],
						[r.x + r.width, r.y + r.height],
						[r.x, r.y + r.height],
					]
					const wallHeight = map.tileHeight * 2

					const rect = new Phaser.Geom.Rectangle(
						r.x,
						r.y - wallHeight,
						r.width,
						wallHeight
					)
					const roomGraphics = this.add.graphics()
					roomGraphics.fillStyle(
						// Phaser.Display.Color.GetColor(255, 255, 255),
						Phaser.Display.Color.GetColor(0, 0, 0),
						0.6
					) // color: 0xRRGGBB

					r.infoBg = roomGraphics.fillRectShape(rect)
					r.infoBg.visible = false
					const roomText = this.add.text(
						r.x + r.width / 2,
						r.y - wallHeight / 2,
						"无主题房间",
						{
							// color: "black",
							// fontWight: 100,
							// fontFamily:
							// 	"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
							// fontFamily:
							// 	'Georgia, "Goudy Bookletter 1911", Times, serif',
						}
					)
					roomText.setWordWrapWidth(r.width - 10, true)
					roomText.setOrigin(0.5, 0.5)
					roomText.setFontSize(14)
					roomText.setLineSpacing(5)
					roomText.visible = false
					r.infoText = roomText
					const resolution = 2

					if (window.isMobile) {
						roomText.setScale(1 / resolution)
						roomText.setOrigin(0.5 * resolution, 0.5 * resolution)
					}
					roomText.setResolution(resolution)
				})

				this.rooms = ol.objects
			}
		})
	}

	checkInRoom() {
		let room = null
		const x = this.user.sprite.x
		const y = this.user.sprite.y
		this.rooms.forEach((r) => {
			const inside = this.isInside([x, y], r.points)
			if (inside) {
				room = r
				// console.log(222)
			}
		})

		if (room) {
			if (this.user.roomId !== room.id) {
				// console.log("enter", room)
				window.showRoomModal({
					data: this.occupiedRooms[room.id],
					id: room.id,
				})
				this.socket.emit("enter room", room.id)
			}
			this.user.roomId = room.id
		} else {
			if (this.user.roomId) {
				this.socket.emit("left room", { roomId: this.user.roomId })
				this.user.roomId = null
			}
		}
	}

	isInside(point, vs) {
		//  vertices
		// ray-casting algorithm based on
		// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
		//   console.log(point, vs);

		var x = point[0],
			y = point[1]

		var inside = false
		for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
			var xi = vs[i][0],
				yi = vs[i][1]
			var xj = vs[j][0],
				yj = vs[j][1]

			var intersect =
				yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
			if (intersect) inside = !inside
		}

		return inside
	}

	setupCamera(userSprite) {
		this.cameras.main.roundPixels = true

		this.cameras.main.startFollow(
			userSprite,
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
	}

	setupInput(user) {
		// Otherwise when camera moves activePointer is not updated
		this.input.setPollAlways()
		const userSprite = user.sprite
		this.input.on("pointerdown", (pointer) => {
			const startX = this.p2t(userSprite.x)
			const startY = this.p2t(userSprite.y)
			const targetX = this.p2t(pointer.worldX)
			let targetY = this.p2t(pointer.worldY)
			if (this.isOutOfBound(targetX, targetY)) {
				return
			}
			let npc = this.checkNPC(targetX, targetY)
			if (npc) {
				targetY++

				// already standing in front of NPC
				if (targetY === startY && targetX === startX) {
					npc.lastWordTime = new Date().getTime()

					window.updateUserBubble(npc)
					return
				}
			}

			this.userMove(user, targetX, targetY, npc)
		})
	}
	checkNPC(tileX, tileY) {
		const pos = tileY * this.map.width + tileX
		return this.NPCs[pos]
	}
	setupNPC() {
		const map = this.map
		// TODO: just hard code now
		const innGuardX = 6
		const innGuardY = 43
		const innGuardPos = innGuardY * this.map.width + innGuardX
		this.NPCs = {
			[innGuardPos]: {
				id: "inn owner",
				sprite: {
					x: innGuardX * this.map.tileWidth,
					y: innGuardY * this.map.tileHeight - 15,
				},

				lastWord: "欢迎光临麦当劳~！",
			},
		}
	}
	leave() {
		this.socket.disconnect()
		this.users = null
	}

	userMoveSocketListener({ id, x, y }) {
		const users = this.users || {}
		const user = users[id]
		if (user) {
			console.log(user, x, y)
			this.userMove(user, x, y)
		} else {
			console.error("user " + id + " not found, move failed")
		}
	}
	userMove(user, targetX, targetY, npc) {
		// NPC means this move is moving in front of NPC
		// at the end of move should trigger NPC conversation
		const sprite = user.sprite
		if (!sprite) return
		const startX = this.p2t(sprite.x)
		const startY = this.p2t(sprite.y)
		const self = user == this.user
		// console.log(user, this.user, self)
		this.easyStar.findPath(startX, startY, targetX, targetY, (path) => {
			// destory previous timeline
			if (sprite.timeline) {
				sprite.timeline.destroy()
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
						targets: sprite,
						x: {
							value: ex * this.map.tileWidth,
							duration: duration,
						},
						y: {
							value: ey * this.map.tileHeight,
							duration: duration,
						},
					})
				}

				sprite.timeline = this.tweens.timeline({
					tweens: tweens,
					onUpdate: (t) => {
						this.checkPos()
						window.updateUserBubble(user)
					},
					onComplete: (t) => {
						if (npc) {
							// trigger npc's bubble
							npc.lastWordTime = new Date().getTime()
							window.updateUserBubble(npc)
						}
						if (self) {
							this.checkInRoom()
						}
					},
				})
				if (self) {
					this.socket.emit("move", { x: targetX, y: targetY })
				}
			}
		})
		this.easyStar.calculate()
	}
	removeUser(userId) {
		const user = this.users[userId]
		if (user) {
			delete this.users[userId]
			user.sprite.destroy()
		}
	}
	addUserSprite(user, tmp) {
		let spriteName = "user-avatar-" + user.id
		if (tmp) {
			spriteName = "questionMark"

			const avatarId = user.id % 20

			this.load.image(
				"user-avatar-" + user.id,
				"/img/avatars/" + avatarId + ".png"
			)
			// TODO: this might cause race condition? e.g.
			// callback may not be for the right user
			this.load.once("complete", () => {
				console.debug(user.id, "avatar loaded")
				this.addUserSprite(user)
				// user.sprite.destroy()
			})
			this.load.start()
		}

		const userSprite = this.add.rexCircleMaskImage(100, 200, spriteName)
		userSprite.setOrigin(0.1, 0)
		userSprite.displayWidth = 40

		// userSprite.setOrigin(0, 0)
		// userSprite.displayWidth = 32

		userSprite.displayHeight = 32
		if (user.sprite) {
			user.sprite.destroy()
		}
		user.sprite = userSprite
		this.setUserPos(user)

		return userSprite
	}
	setUserPos(user, x, y) {
		if (x && y) {
			user.x = x
			user.y = y
		}
		// sprite position is always based on user position

		user.sprite.x = user.x * this.map.tileWidth
		user.sprite.y = user.y * this.map.tileHeight
	}
	addUser(user) {
		if (this.users[user.id]) {
			console.warn("user already added")
			return user
		}
		this.users[user.id] = user

		this.addUserSprite(user, true)

		return user
	}
	addAllUsers(users) {
		console.log("addAllUsers", users)
		users.forEach((u) => {
			this.addUser(u)
		})
	}
	message({ userId, message }) {
		const user = this.users[userId]
		user.lastWord = message
		user.lastWordTime = new Date().getTime()
		window.updateUserBubble(user)
	}

	setupSocket(user) {
		console.log("setup socket")
		let socketUrl = "/"
		if (window.location.hostname.includes("localhost")) {
			socketUrl = window.location.hostname + ":8081"
		}
		const socket = io.connect(socketUrl, {
			query: "scene=" + this.sceneName + "&id=" + user.id,
		})
		this.socket = socket
		window.socket = socket

		socket.on("move", this.userMoveSocketListener.bind(this))
		// self user is created on scene creation, socket login
		// event should be used to retrieve latest user data
		// socket.on("logged in", this.login.bind(this))
		socket.on("new user", this.addUser.bind(this))
		socket.on("remove user", this.removeUser.bind(this))
		socket.on("all users", this.addAllUsers.bind(this))
		socket.on("message", this.message.bind(this))
		socket.on("rooms", this.setOccupiedRooms.bind(this))
		socket.on("room updated", this.roomUpdateListener.bind(this))
		socket.on("enter room", this.otherEnterRoomListner.bind(this))
		socket.on("room message", (data) => {
			if (window.roomMessageListener) {
				window.roomMessageListener(data)
			} else {
				console.error("roomMessageListener not defined")
			}
		})
		socket.on("left room", (u) => {
			if (window.otherLeftRoomListener) {
				window.otherLeftRoomListener(u)
			} else {
				console.error("otherLeftRoomListener not defined")
			}
		})
		socket.on("users in room", (users) => {
			if (window.userInRoomListener) {
				window.userInRoomListener(users)
			} else {
				console.error("userInRoomListner not defined")
			}
		})
		socket.on("audio toggle", (data) => {
			if (window.otherUserAudioToggleListener) {
				window.otherUserAudioToggleListener(data)
			} else {
				console.error("otherUserAudioToggleListener not defined")
			}
		})
		// console.log(this.addUser)
		// console.log(this.addUser.bind(this))
	}

	update() {
		const tileX = this.p2t(this.input.activePointer.worldX)
		const tileY = this.p2t(this.input.activePointer.worldY)
		if (this.isOutOfBound(tileX, tileY)) {
			return
		}
		// console.log(this.map, tileY, tileX)
		let collide = this.map.collisionArray[tileY][tileX]
		const x = tileX * this.map.tileWidth
		const y = tileY * this.map.tileWidth
		// if (tileX === 6 && tileY === 43) {
		// 	collide = false
		// }
		const hoverOnNPC = this.checkNPC(tileX, tileY)
		if (hoverOnNPC) {
			collide = false
		}
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
