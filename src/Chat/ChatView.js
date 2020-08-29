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
				pointerEvents: "none",
			}}
		>
			{messages.map((m, index) => {
				return (
					<span key={index}>
						<span className="chat-line">
							{m.user.name}:{"  "}
							{m.message}
						</span>
						<br />
					</span>
				)
			})}
		</div>
	)
}

export default ChatView
