var Game = {
	avatarSize: {
		width: 32,
		height: 32,
	},
	meetingUrl: "https://master.dgzksrp39jvi9.amplifyapp.com",
	// https://master.dgzksrp39jvi9.amplifyapp.com/?room=kitchen&username=mike&profile_image_url=https://huluverse.hulu.com/download-profile/%7Bff93fd30-6b45-4e6a-92fd-367a2e9cca5a%7D/profile/crxlarge?noCache=3040219
}

Game.init = function () {
	game.stage.disableVisibilityChange = true
	let savedPos = localStorage.getItem("pos")
	if (savedPos) {
		Game.savedPos = JSON.parse(savedPos)
		// if (savedPos.x < 200 && savedPos.y < 200) {
		//   savedPos.x = Math.floor(savedPos.x);
		//   savedPos.y = Math.floor(savedPos.y);
		//   Game.savedPos = savedPos;
		// }
	}
}

Game.preload = function () {
	console.log("preload")

	// game.load.crossOrigin = false
	game.load.tilemap(
		"map",
		// "assets/map/example_map.json",
		"assets/map/hulu.json",
		null,
		Phaser.Tilemap.TILED_JSON
	)
	game.load.spritesheet("tileset", "assets/tilesets/tilesheet.png", 32, 32)
	game.load.spritesheet(
		"office_tileset",
		"assets/tilesets/office.png",
		32,
		32
	)
	game.load.image("white", "assets/sprites/white.png")
	game.load.image("video", "assets/sprites/video.png")
	game.load.image("bubble", "assets/sprites/bubble.png")
	// load window photos, lol, no, just use bootstrap modal
	// game.load.image("bottom", "assets/photo/bottom.png");
	// game.load.image("top", "assets/photo/top.png");
	// game.load.image("right", "assets/photo/right.png");
	// game.load.image("left", "assets/photo/left.png");
	// game.load.image("bottom_left", "assets/photo/bottom_left.png");
}

Game.create = function () {
	console.log("create")
	Game.userMap = {}
	var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
	enterKey.onDown.add(Client.sendMessage, this)
	var map = game.add.tilemap("map")
	Game.map = map
	// console.log(map);
	// map.addTilesetImage("hulu_tileset", "tileset") // tilesheet is the key of the tileset in map's JSON file
	map.addTilesetImage("tilesheet", "tileset")
	map.addTilesetImage("office", "office_tileset")
	// map.gameLayer = [];
	var layer
	for (var i = 0; i < map.layers.length; i++) {
		layer = map.createLayer(i)
		// console.log(layer);
		if (layer.layer && layer.layer.name === "above") {
			// console.log(layer);
			layer.z = 9999
		}
		// map.gameLayer.push(layer);
	}
	layer.inputEnabled = true // Allows clicking on the map ; it's enough to do it on the last layer
	layer.events.onInputUp.add(Game.onClick, this)
	Client.login()

	// const user = game.add.sprite(300, 300, "hero")
	game.camera.bounds.width = 9999
	game.camera.bounds.height = 9999
	game.camera.x = 500
	game.camera.y = 700
	// game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
	// game.camera.follow(user)
	setupCollision(map)
	setupDoors(map)
	setupLabels(map)
	setupMeetingRooms(map)
	setupWindows(map)

	// setupCallIcon();
}

// function setupCallIcon() {

// }

Game.onClick = function (layer, pointer) {
	Client.sendClick(p2t(pointer.worldX), p2t(pointer.worldY))
}

Game.addNewUser = function (userData, self) {
	self = !!self
	let { id, x, y } = userData
	// convert x, y to pixel
	x = x * 32
	y = y * 32
	let user = Game.userMap[id]
	if (user) return
	const avatarAssetKey = "user-" + String(id)
	// console.log(userData, avatarAssetKey)

	game.load.image(avatarAssetKey, userData.avatar)
	game.load.start()
	game.load.onLoadComplete.add(() => {
		user = Game.userMap[id]
		if (user) return

		// console.debug(avatarAssetKey, "loaded");
		user = game.add.sprite(x, y, avatarAssetKey)
		user.inputEnabled = true

		const whiteBg = game.add.sprite(0, 0, "white")
		const callIcon = game.add.sprite(0, 0, "video")
		const nameText = game.add.text(0, 0, userData.name, {
			font: "15px pixel",
			// fill: "#ff0000", red
			// fill: "#ffffff",
			// fill: "#000000",
			stroke: "#000000",
			strokeThickness: 1,
		})
		whiteBg.inputEnabled = true
		whiteBg.width = 120
		whiteBg.height = 210
		whiteBg.anchor.y = 1
		callIcon.inputEnabled = true
		callIcon.width = 48
		callIcon.height = 48

		callIcon.events.onInputDown.add(() => {
			const oneOnOneRoom = (Game.myUser.id + "" + user.id)
				.split(".")
				.join("")
			console.debug("call user", user, oneOnOneRoom)
			Client.oneOnOne(user.id, oneOnOneRoom)
			joinMeeting(Game.myUser, oneOnOneRoom)
		}, this)

		callIcon.events.onInputOver.add(() => {
			user.width = 100
			user.height = 100
			if (user.tween) {
				user.tween.pause()
			}
			user.anchor.y = 1

			whiteBg.x = user.x - 10
			whiteBg.y = user.y + 100
			game.world.bringToTop(whiteBg)
			game.world.bringToTop(user)
			game.world.bringToTop(nameText)
			game.world.bringToTop(callIcon)

			callIcon.x = user.x + 25
			callIcon.y = user.y + 35
			nameText.x = user.x + 5
			nameText.y = user.y + 10
		}, this)

		user.events.onInputOver.add(() => {
			// except for self?

			user.inputEnabled = false
			user.anchor.y = 1

			// console.log("click on ", user);
			user.width = 100
			user.height = 100
			if (user.tween) {
				user.tween.pause()
			}
			// user.z = 999;
			// game.world.sort();

			whiteBg.x = user.x - 10
			whiteBg.y = user.y + 100
			game.world.bringToTop(whiteBg)
			game.world.bringToTop(user)
			game.world.bringToTop(nameText)

			game.world.bringToTop(callIcon)
			// whiteBg.events.onInputOver.add(() => {
			//   Game.hoveringCallIcon = true;
			// }, this);
			nameText.x = user.x + 5
			nameText.y = user.y + 10
			callIcon.x = user.x + 25
			callIcon.y = user.y + 35
			// Game.callIcon.anchor.y = 1;
		}, this)

		whiteBg.events.onInputOut.add(() => {
			whiteBg.x = -999
			callIcon.x = -999
			nameText.x = -999
			user.width = Game.avatarSize.width
			user.height = Game.avatarSize.height
			user.inputEnabled = true
			user.anchor.y = 0

			if (user.tween) {
				user.tween.resume()
			}
		}, this)

		// user.events.onInputOut.add(() => {
		//   if (Game.hoveringCallIcon) return;
		//   // console.log("click on ", user);
		//   user.width = Game.avatarSize.width;
		//   user.height = Game.avatarSize.height;
		//   if (user.tween) {
		//     user.tween.resume();
		//   }
		//   Game.callIcon.x = 0;
		//   Game.callIcon.y = 0;
		// }, this);
		// image.events.onInputOver.add(over, this);image.events.onInputOut.add(out, this);

		Game.userMap[id] = user
		user.id = id
		user.name = userData.name
		user.avatar = userData.avatar

		// user.width = 45
		// user.height = 48
		// user.anchor.x = 0.25
		// user.anchor.y = 0.35
		user.width = Game.avatarSize.width
		user.height = Game.avatarSize.height
		// user.anchor.y = 1;
		if (user.width === 48) {
			user.anchor.x = 0.15 // width = 48
		}

		if (self) {
			console.log("login success!", user)
			game.camera.follow(user)
			Game.myUser = user
			user.z = 1000
			if (Game.savedPos) {
				user.x = Game.savedPos.x
				user.y = Game.savedPos.y
			}
		}
	})
}
Game.handleMovement = (id, x, y, AI) => {
	if (!Game.userMap || !Game.myUser) return
	var user = Game.userMap[id]
	if (!user) {
		console.error("user not loaded, cannot move", id)
		return
	}
	const tileX = p2t(user.x)
	const tileY = p2t(user.y)

	const targetTileX = x
	const targetTileY = y
	Game.easystar.findPath(tileX, tileY, targetTileX, targetTileY, (path) => {
		// console.debug(path)
		if (path && path.length) {
			Game.moveUser(user, path, AI)
		} else {
			if (!AI) {
				console.log("cannot go there")
			}
		}
	})
	Game.easystar.calculate()
}
Game.moveUser = function (user, path, AI) {
	const self = user.id === Game.myUser.id
	// var distance = Phaser.Math.distance(player.x, player.y, x, y)
	// var tween = game.add.tween(player)
	// var duration = distance * 1
	// tween.to({ x: x, y: y }, duration)
	// tween.start()
	if (user.tween) {
		// stop previous tween if tweening
		user.tween.stop()
	}
	const delta = 0
	const slowness = AI ? 500 : 100
	// Converts the cell coordinates in pixels coordinates, for the movement tween
	var x_steps = []
	var y_steps = []
	for (var q = 0; q < path.length; q++) {
		x_steps.push(path[q].x * Game.map.tileWidth)
		y_steps.push(path[q].y * Game.map.tileWidth)
	}
	var tween = game.add.tween(user)
	user.tween = tween
	this.lastOrientationCheck = 0 // timestamp at which the orientation of the sprite was checked for the last time
	var duration = Math.ceil(Math.max(1, path.length * slowness - delta)) // duration of the movement, based on player speed, path length and latency
	tween.to({ x: x_steps, y: y_steps }, duration)
	tween.onUpdateCallback(function () {
		if (user.bubble) {
			user.bubble.x = user.x
			user.bubble.y = user.y
		}
		if (user.lastWord) {
			user.lastWord.x = user.x - 50
			user.lastWord.y = user.y - 120
		}

		const door = Game.checkTeleport(user.x, user.y)
		if (door) {
			console.log("on teleport")
			tween.stop()
			user.x = door.destination.x
			user.y = door.destination.y
		}
		if (self) {
			const room = Game.checkInMeetingRoom(user.x, user.y)
			if (room) {
				if (!user.room) {
					console.log("enter meeting room", room)
					$("#enter-room-modal").modal()
					Game.roomName = room.name
					// joinMeeting(user, room.name);
				}
				user.room = room
				//  tween.stop();
			} else {
				if (user.room) {
					console.log("left meeting room", user.room)

					user.room = null
					if (user.meetingWindow) {
						// window might be blocked and never opened
						user.meetingWindow.close()
					}
				}
			}
		}
	}, this)
	tween.onComplete.add(function () {
		// console.debug(user.id, Game.myUser.id);
		if (self) {
			localStorage.setItem(
				"pos",
				JSON.stringify({ x: user.x, y: user.y })
			)
			console.log("done moving self", user.x, user.y)
			Game.checkWindow(user.x, user.y)
		}
	}, this)
	this.tween = tween
	tween.start()
}

Game.removeUser = function (id) {
	Game.userMap[id].destroy()
	delete Game.userMap[id]
}
Game.checkInMeetingRoom = (x, y) => {
	let res = null

	Game.rooms.forEach((r) => {
		const inside = isInside([x, y], r.points)
		if (inside) {
			res = r
		}
	})
	return res
}

Game.checkWindow = (x, y) => {
	let byWindow = false
	Game.windows.forEach((w) => {
		const inside = isInside([x, y], w.points)
		if (inside) {
			byWindow = true
			if (Game.myUser.window != w) {
				console.log("changed window", w.name)
				Game.myUser.window = w
				$("#image-modal").modal()
				$("#photo").attr("src", "/assets/photo/" + w.name + ".png")
			}
		}
	})
	if (!byWindow) {
		Game.myUser.window = null
	}
}

Game.checkTeleport = (x, y) => {
	let res = null
	Game.doors.forEach((d) => {
		const inside = isInside([x, y], d.points)
		if (inside) {
			res = d
		}
	})
	return res
}

p2t = (pixelVal) => {
	return Math.floor(pixelVal / 32)
}
setupDoors = (map) => {
	// Game.doors = {};
	Game.doors = []
	map.objects.doors.forEach((d) => {
		console.log(d)
		d.points = []
		d.points.push([d.x, d.y])
		d.points.push([d.x + d.width, d.y])
		d.points.push([d.x + d.width, d.y + d.height])
		d.points.push([d.x, d.y + d.height])

		d.destination = d.properties
		console.log(d)
		Game.doors.push(d)
	})
}
setupLabels = (map) => {
	map.objects.labels.forEach((l) => {
		let fontSize = 72
		if (l.name === "Colorado Center Park") {
			fontSize = 48
		}
		game.add.text(l.x, l.y, l.name, {
			font: fontSize + "px pixel",
			// fill: "#ff0000", red
			fill: "#ffffff",
			stroke: "#000000",
			strokeThickness: 3,
		})
	})
}

setupCollision = (map) => {
	// Create the grid used for pathfinding ; it consists in a 2D array of 0's and 1's, 1's indicating collisions
	easystar = new EasyStar.js()
	Game.easystar = easystar
	// console.debug(map);
	const collisionArray = []
	for (var y = 0; y < map.height; y++) {
		var col = []
		for (var x = 0; x < map.width; x++) {
			var collide = false

			map.layers.forEach((l) => {
				if (l.properties.collision) {
					const hasTile = l.data[y][x].index != -1
					// var tile = map.getTile(x, y, l)
					if (hasTile) {
						collide = true
						// break
					}
				}
			})
			col.push(+collide) // "+" to convert boolean to int
		}
		collisionArray.push(col)
	}
	// console.log(collisionArray)

	easystar.setGrid(collisionArray)
	// diagonal not allowed
	// easystar.enableDiagonals()
	// tell easystar that 0 means walkable, other values are not
	easystar.setAcceptableTiles([0])
}
function setupWindows(map) {
	map.objects.windows.forEach((r) => {
		r.points = [
			[r.x, r.y],
			[r.x + r.width, r.y],
			[r.x + r.width, r.y + r.height],
			[r.x, r.y + r.height],
		]
	})
	Game.windows = map.objects.windows
}
function setupMeetingRooms(map) {
	map.objects.rooms.forEach((r) => {
		r.points = [
			[r.x, r.y],
			[r.x + r.width, r.y],
			[r.x + r.width, r.y + r.height],
			[r.x, r.y + r.height],
		]
	})
	Game.rooms = map.objects.rooms
}

function isInside(point, vs) {
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

function joinMeeting(user, roomName) {
	const params = {
		room: roomName,
		username: user.name,
		profile_image_url: user.avatar,
	}
	const urlParams = new URLSearchParams(params)
	const url = Game.meetingUrl + "/?" + urlParams.toString()
	user.meetingWindow = window.open(
		url,
		"meeting-" + roomName,
		"height=480; width=480"
	)
	console.log(url)
}

Game.showMessage = (data) => {
	const { userId, message } = data
	console.log(data)
	const user = Game.userMap[userId]
	if (!user) {
		console.error("cannot talk, user not found", userId)
	}

	if (user.lastWord) {
		user.lastWord.destroy()
		user.bubble.destroy()
	}
	const chatBubble = game.add.sprite(user.x, user.y, "bubble")
	chatBubble.width = 200
	chatBubble.height = 150
	chatBubble.anchor.y = 1
	chatBubble.anchor.x = 0.4
	const chatMessage = game.add.text(user.x - 50, user.y - 120, message, {
		font: "15px",
		// fill: "#ff0000", red
		// fill: "#ffffff",
		// fill: "#000000",
		stroke: "#000000",
		strokeThickness: 0.5,
		wordWrap: true,
		wordWrapWidth: 150,
		// wordWrap: { width: 220, useAdvancedWrap: true },
	})
	user.lastWord = chatMessage
	user.bubble = chatBubble
	setTimeout(() => {
		chatMessage.destroy()
		chatBubble.destroy()
	}, 5 * 1000)
}
