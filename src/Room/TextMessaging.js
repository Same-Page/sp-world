import React, { useState, useEffect } from "react"
import Peer from "peerjs"
import { Input, message, Switch } from "antd"

import Conversation from "./Conversation"

function TextMessaging({ user }) {
	const [messages, setMessages] = useState([])
	const [input, setInput] = useState()

	return (
		<>
			<Conversation
				// backgroundColor="rgb(246, 249, 252)"
				messages={messages}
				// background={room.background}
				// messageActions={messageActions}
			/>
			<Input
				// style={{ position: "absolute", bottom: 0 }}
				placeholder="在这里输入。。。"
				onChange={(e) => {
					setInput(e.target.value)
				}}
				value={input}
				onPressEnter={() => {
					// console.log(input)
					// peerConnections.forEach((c) => {
					// 	c.send(input)
					// })
					setMessages((msgs) => {
						const time = new Date().getTime()

						const m = {
							content: { type: "text", value: input },
							created_at: time,
							id: time,
							user: {
								id: user.id,
								name: user.name,
								avatarSrc:
									"https://dnsofx4sf31ab.cloudfront.net/1.jpg?v=11",
							},
						}
						return [...msgs, m]
					})
					setInput("")
					// window.socket.emit("message", input)
				}}
			/>
		</>
	)
}

export default TextMessaging
