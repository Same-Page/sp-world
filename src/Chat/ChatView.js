import React, { useState, useEffect } from "react"
// import { Input } from "antd"

function ChatView({ socket }) {
	const [messages, setMessages] = useState([])

	useEffect(() => {}, [socket])

	return (
		<div>
			{messages.map((m) => {
				return (
					<p key={m.id}>
						<span>{m.user.name}</span>
						{m.content.value}
					</p>
				)
			})}
		</div>
	)
}

export default ChatView
