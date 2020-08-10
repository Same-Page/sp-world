var express = require("express")
var app = express()
var server = require("http").Server(app)
var io = require("socket.io").listen(server)
var fs = require("fs")
const axios = require("axios")

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
	const id = new Date().getTime()
	const user = { id, name: id, x: 6, y: 48 }
	socket.user = user // socket.broadcast won't include self // io.sockets.emit would
	socket.broadcast.emit("new user", user)
	socket.emit("logged in", user)
	socket.emit(
		"all users",
		getAllUsers().filter((u) => u.id !== id)
	)

	socket.on("move", ({ x, y }) => {
		// console.log("click to " + data.x + ", " + data.y)
		socket.user.x = x
		socket.user.y = y
		// io.emit("move", socket.user)
		socket.broadcast.emit("move", { id, x, y })
	})
	socket.on("message", function (data) {
		socket.broadcast.emit("message", {
			userId: socket.user.id,
			message: data,
		})
	})
	socket.on("one on one", function (data) {
		const { userId, roomName } = data
		const inviterName = socket.user.name
		Object.keys(io.sockets.connected).forEach((socketID) => {
			const s = io.sockets.connected[socketID]
			if (s.user && s.user.id === userId) {
				console.debug("invitation", roomName, inviterName)
				s.emit("one on one", {
					roomName,
					name: inviterName,
				})
			}
		})
	})
	socket.on("disconnect", function () {
		io.emit("remove user", socket.user.id)
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
