var express = require("express")
var app = express()
var server = require("http").Server(app)
var io = require("socket.io").listen(server)
var fs = require("fs")
const axios = require("axios")
const path = require("path")
// app.use(express.static(path.join(__dirname, "../build")))

app.use(express.static(path.join(__dirname, "../build")))

server.lastPlayderID = 0

server.listen(process.env.PORT || 8081, function () {
	console.log("Listening on " + server.address().port)
})

//  const mapDataRaw = fs.readFileSync("assets/map/hhhh.json", "utf-8")
// const mapData = JSON.parse(mapDataRaw)
// const collisionArray = []
const getOnlineUsers = () => {
	var users = []
	Object.keys(io.sockets.connected).forEach((socketID) => {
		var user = io.sockets.connected[socketID].user
		if (user) users.push(user)
	})
	return users
}

const getAllUsers = () => {
	// return offline users too
	return getOnlineUsers()
}
const randomInt = (low, high) => {
	return Math.floor(Math.random() * (high - low) + low)
}

const rooms = {
	"sm-1": {
		id: "sm-1",
		name: "韩综/大逃脱",
		about: "第三季E03丧尸工厂, 胆小鬼勿入!!!",
		url: "https://www.bilibili.com/video/BV1Ax411Z7Bo?p=29",
		iframe:
			"//player.bilibili.com/player.html?aid=56796302&bvid=BV1Ax411Z7Bo&cid=165014155&page=29",
	},
}

io.on("connection", (socket) => {
	//   console.log(socket.handshake.headers);
	// socket.on("login", () => {
	// axios
	// 	.get("https://sdfasdfsadf.com/misdfdlk/", {
	// 		headers: {
	// 			cookie: socket.handshake.headers.cookie,
	// 		},
	// 	})
	// 	.then((response) => {
	// const scene = socket.handshake.query.scene
	// TODO: change to check cookie
	const id = socket.handshake.query.id
	// console.log(scene)

	// const id = new Date().getTime()
	const user = { id, name: id, x: 6, y: 50 }

	socket.user = user // socket.broadcast won't include self // io.sockets.emit would
	socket.emit("logged in", user)

	socket.on("enter scene", ({ sceneName, entrance }) => {
		socket.join(sceneName)
		if (socket.scene) {
			socket.leave(socket.scene)
			socket
				.to(socket.scene)
				.broadcast.emit("remove user", socket.user.id)
		}
		socket.scene = sceneName
		if (sceneName === "village") {
			if (entrance === "yard") {
				user.x = 88
				user.y = 71
			} else {
				user.x = 81
				user.y = 74
			}
		} else {
			if (entrance === "yard") {
				user.x = 30
				user.y = 30
			} else {
				user.x = 6
				user.y = 50
			}
		}
		socket.to(sceneName).broadcast.emit("new user", user)

		const usersInScene = getUsersInRoom(sceneName)

		socket.emit("all users", usersInScene)
		if (sceneName === "inn") {
			socket.emit("rooms", rooms)
		}
	})

	socket.on("move", ({ x, y }) => {
		// console.log("click to " + data.x + ", " + data.y)
		socket.user.x = x
		socket.user.y = y
		// io.emit("move", socket.user)
		socket.to(socket.scene).broadcast.emit("move", { id, x, y })
	})
	socket.on("message", function (data) {
		socket.to(socket.scene).broadcast.emit("message", {
			user: socket.user,
			message: data,
		})
	})
	socket.on("room message", function (data) {
		const roomId = socket.roomId
		socket.to(roomId).broadcast.emit("room message", {
			user: socket.user,
			message: data,
		})
	})
	socket.on("audio toggle", ({ on }) => {
		socket.user.audio = on
		if (socket.roomId) {
			socket.to(socket.roomId).broadcast.emit("audio toggle", socket.user)
		}
	})
	socket.on("left room", (roomId) => {
		if (socket.roomId) {
			socket.leave(socket.roomId)
			socket.to(socket.roomId).broadcast.emit("left room", socket.user)
			socket.roomId = null
		} else {
			console.error("cannot leave room, not in room", socket.user)
		}
	})

	socket.on("enter room", (roomId) => {
		socket.join(roomId)
		socket.roomId = roomId
		const usersInRoom = getUsersInRoom(roomId)
		socket.emit("users in room", usersInRoom)
		socket.to(roomId).broadcast.emit("enter room", socket.user)
		// users already in the room will try to p2p connect with the new user
	})
	socket.on("update room", (room) => {
		// todo: don't wipe user data
		rooms[room.id] = room
		socket.to(socket.scene).broadcast.emit("rooms", rooms)
		socket.emit("room updated", room)
	})
	// socket.on("one on one", function (data) {
	// 	const { userId, roomName } = data
	// 	const inviterName = socket.user.name
	// 	Object.keys(io.sockets.connected).forEach((socketID) => {
	// 		const s = io.sockets.connected[socketID]
	// 		if (s.user && s.user.id === userId) {
	// 			console.debug("invitation", roomName, inviterName)
	// 			s.emit("one on one", {
	// 				roomName,
	// 				name: inviterName,
	// 			})
	// 		}
	// 	})
	// })
	socket.on("disconnect", function () {
		if (socket.scene) {
			socket
				.to(socket.scene)
				.broadcast.emit("remove user", socket.user.id)
		}
		if (socket.roomId) {
			socket.to(socket.roomId).broadcast.emit("left room", socket.user)
		}
	})
	// })
	// .catch((error) => {
	// 	socket.emit("not logged in", {})

	// 	console.log(error)
	// })

	// function getOnlineUserIdMap() {
	// 	const res = {}
	// 	Object.keys(io.sockets.connected).forEach((socketID) => {
	// 		var user = io.sockets.connected[socketID].user
	// 		if (user) res[user.id] = user
	// 	})
	// 	return res
	// }
	// const isUserOnline = (id)=> {
	// 	const onlineUserIdMap = getOnlineUserIdMap() //   console.log(id, Object.keys(onlineUserIdMap));
	// 	const isOnline = id in onlineUserIdMap //   console.log(isOnline);
	// 	return isOnline
	// }
})

const getUsersInRoom = (roomId) => {
	const room = io.sockets.adapter.rooms[roomId]
	if (!room) {
		return []
	}
	const usersInRoom = Object.keys(room.sockets).map((sid) => {
		const s = io.sockets.connected[sid]
		return s.user
	})
	return usersInRoom
}
