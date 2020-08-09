import React, { useState, useEffect } from "react"
import ChatInput from "./ChatInput"

import ChatBubble from "./ChatBubble"

function Chat() {
	const [users, setUsers] = useState([])

	useEffect(() => {
		window.updateUserBubble = (user) => {
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
	})

	return (
		<>
			{users.map((u) => {
				return <ChatBubble user={u} key={u.id} />
			})}
			<ChatInput />
		</>
	)
}

export default Chat
