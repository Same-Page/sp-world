import React, { useState, useEffect } from "react"
import io from "socket.io-client"

import "./App.css"
import "antd/dist/antd.css"

import Game from "./Game"
import Chat from "./Chat"
import Room from "./Room"

function App() {
	const [socket, setSocket] = useState()

	const [user, setUser] = useState()
	useEffect(() => {
		// TODO: load user from localStorage
		// if no user data, create a visitor user
		const userId = new Date().getTime() % 1000
		const user = {
			id: userId,
			name: userId,
		}
		setUser(user)
		window.user = user

		let socketUrl = "/"
		if (window.location.hostname.includes("localhost")) {
			socketUrl = window.location.hostname + ":8081"
		}
		const s = io.connect(socketUrl, {
			query: "scene=inn&id=" + userId,
		})
		// const s = io.connect(socketUrl)
		setSocket(s)
		window.socket = s
	}, [])

	return (
		<div className="App">
			{socket && user && (
				<>
					<Game user={user} socket={socket} />
					<Chat user={user} socket={socket} />
					<Room user={user} socket={socket} />
				</>
			)}

			{!socket && <>连接中。。。</>}
		</div>
	)
}

export default App
