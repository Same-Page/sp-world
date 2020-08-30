import React from "react"
import "./ChatView.css"
import { message } from "antd"

function ChatView({ messages }) {
	const height = window.innerHeight / 3
	const top = window.innerHeight - height - 30
	console.log(messages)
	return (
		<div
			style={{
				position: "absolute",
				top,
				height,
				// left: 0,
				overflow: "hidden",
				color: "white",
				fontWeight: "bold",
				pointerEvents: "none",
			}}
		>
			{messages.map((m, index) => {
				return (
					<span key={index}>
						{!m.timeup && (
							<>
								<span className="chat-line">
									{m.user.name}:{"  "}
									{m.message}
								</span>
								<br />
							</>
						)}
					</span>
				)
			})}
		</div>
	)
}

export default ChatView
