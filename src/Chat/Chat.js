import React, { useState, useEffect } from "react"
import ChatInput from "./ChatInput"
import ChatView from "./ChatView"
import NearbyUsers from "./NearbyUsers"
import ChatBubbles from "./ChatBubbles"

function Chat({ user, socket }) {
	const [messages, setMessages] = useState([])
	const addMsg = (data) => {
		setMessages((msgs) => {
			return [data, ...msgs]
		})
		setTimeout(() => {
			data.timeup = true

			setMessages((msgs) => {
				return [...msgs]
			})
		}, 20 * 1000)
	}
	useEffect(() => {
		const messageHandler = (data) => {
			addMsg(data)

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
			<ChatInput user={user} addMsg={addMsg} socket={socket} />
		</>
	)
}

export default Chat
