import React from "react"
import "./ChatView.css"

function ChatView({ messages }) {
	const height = window.innerHeight / 3
	const top = window.innerHeight - height - 30

	return (
		<div
			style={{
				position: "absolute",
				top,
				height,
				left: 10,
				overflow: "auto",
				color: "white",
				fontWeight: "bold",
			}}
		>
			{messages.map((m) => {
				return (
					<span key={m.id}>
						<span className="chat-line">
							{m.user.name}:{"  "}
							{m.message}
						</span>

						<br />
						<br />
					</span>
				)
			})}
		</div>
	)
}

export default ChatView
