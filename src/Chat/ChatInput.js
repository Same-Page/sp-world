import React, { useState } from "react"
import { Input } from "antd"

function ChatInput({ setMessages, socket }) {
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
					window.user.lastWord = input
					window.user.lastWordTime = new Date().getTime()
					window.updateUserBubble(window.user)

					setInput("")
					socket.emit("message", input)
					setMessages((msgs) => {
						return [
							{
								user: window.user,
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
