import React, { useState, useEffect, useRef } from "react"

function ChatBubble({ user }) {
	const [show, setShow] = useState(true)
	const [updateCounter, setUpdateCounter] = useState(0)
	const bubbleRef = useRef()
	useEffect(() => {
		if (user.bubbleTimeout) {
			clearTimeout(user.bubbleTimeout)
		}

		setShow(true)
		// force rerender with updated left offset
		setUpdateCounter((c) => c + 1)

		user.bubbleTimeout = setTimeout(() => {
			setShow(false)
		}, 3000)
		// console.log("use effect")
	}, [user.lastWordTime])

	// console.log(user.lastWord)
	const left =
		16 +
		user.x -
		window.scene.cameras.main.scrollX -
		(bubbleRef.current ? bubbleRef.current.clientWidth / 2 : 0)
	// console.log(left)
	// console.log(
	// 	user.x,
	// 	bubbleRef.current ? bubbleRef.current.clientWidth : false
	// )
	const top = user.y - window.scene.cameras.main.scrollY
	const bottom = window.innerHeight - top + 5
	return (
		<div
			ref={bubbleRef}
			style={{
				position: "absolute",
				bottom,
				left,
				background: "white",
				padding: 7,
				borderRadius: 5,
				maxWidth: 200,
				maxHeight: 200,
				overflow: "auto",
				visibility: show && user.lastWord ? "visible" : "hidden",
				wordWrap: "break-word",
				whiteSpace: "pre-wrap",
			}}
		>
			{user.lastWord}
		</div>
	)
}

export default ChatBubble
