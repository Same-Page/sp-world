import React, { useState } from "react"
import { Input } from "antd"

function ChatInput({ user, setMessages, socket }) {
	const [input, setInput] = useState()

	return (
		<>
			<Input
				style={{ position: "absolute", bottom: 0 }}
				placeholder="在这里输入。。。"
				onChange={(e) => {
					setInput(e.target.value)
				}}
				value={input}
				onPressEnter={() => {
					// console.log(input)
					user.lastWord = input
					user.lastWordTime = new Date().getTime()
					window.updateUserBubble(window.user)

					setInput("")
					socket.emit("message", input)
					setMessages((msgs) => {
						return [
							{
								user: user,
								message: input,
							},
							...msgs,
						]
					})
				}}
			/>
		</>
	)
}

export default ChatInput
