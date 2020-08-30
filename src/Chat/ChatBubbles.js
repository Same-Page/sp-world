import React, { useState, useEffect } from "react"

import Bubble from "./ChatBubble"

function ChatBubbles() {
	const [users, setUsers] = useState([])
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
		}
	}, [])

	return users.map((u) => {
		return <Bubble user={u} key={u.id} />
	})
}

export default ChatBubbles
