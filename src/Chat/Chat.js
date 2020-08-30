import React, { useState, useEffect } from "react"
import ChatInput from "./ChatInput"
import ChatView from "./ChatView"
import NearbyUsers from "./NearbyUsers"
import ChatBubbles from "./ChatBubbles"

function Chat({ user, socket }) {
	const [messages, setMessages] = useState([])
	useEffect(() => {
		const messageHandler = (data) => {
			setMessages((msgs) => {
				return [data, ...msgs]
			})

			const user = window.users[data.user.id]
			user.lastWord = data.message
			user.lastWordTime = new Date().getTime()
			window.updateUserBubble(user)
		}
		socket.on("message", messageHandler)

		return () => {
			socket.off("message", messageHandler)
		}
	}, [socket])

	return (
		<>
			<NearbyUsers user={user} socket={socket} />
			<ChatView messages={messages} />

			<ChatBubbles />

			<ChatInput user={user} setMessages={setMessages} socket={socket} />
		</>
	)
}

export default Chat
