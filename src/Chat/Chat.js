import React, { useState, useEffect } from "react"
import ChatInput from "./ChatInput"
import ChatView from "./ChatView"

import ChatBubble from "./ChatBubble"

function Chat({ user, socket }) {
	const [users, setUsers] = useState([])
	const [messages, setMessages] = useState([])
	useEffect(() => {
		const messageHandler = (data) => {
			setMessages((msgs) => {
				return [data, ...msgs]
			})
		}
		socket.on("message", messageHandler)

		return () => {
			socket.off("message", messageHandler)
		}
	}, [socket])

	useEffect(() => {
		window.updateUserBubble = (user) => {
			// console.debug(user)
			if (!user) {
				console.error("no user")
			}

			// call this when message or user position is updated
			setUsers((users) => {
				// console.log(users, user)
				const existingUsers = users.filter((u) => {
					return u.id !== user.id
				})

				return [...existingUsers, user]
			})
			// console.log("updateUserBubble")
		}
	}, [])

	return (
		<>
			<ChatView messages={messages} />
			{users.map((u) => {
				return <ChatBubble user={u} key={u.id} />
			})}

			<ChatInput setMessages={setMessages} socket={socket} />
		</>
	)
}

export default Chat
