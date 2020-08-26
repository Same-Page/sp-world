import React, { useState, useEffect, useRef } from "react"

function ChatBubble({ user }) {
	const [show, setShow] = useState(true)
	const [visible, setVisibility] = useState(false)
	const [updateCounter, setUpdateCounter] = useState(0)
	const bubbleRef = useRef()
	useEffect(() => {
		if (user.bubbleTimeout) {
			clearTimeout(user.bubbleTimeout)
		}

		setShow(true)
		setTimeout(() => {
			setVisibility(true)
			// setUpdateCounter((c) => {
			// 	return c + 1
			// })
		}, 100)
		// force rerender with updated left offset
		setUpdateCounter((c) => c + 1)

		user.bubbleTimeout = setTimeout(() => {
			setShow(false)
			setVisibility(false)
		}, 5000)
		// console.log("use effect")
	}, [user.lastWordTime])

	// console.log(user.lastWord)
	const left =
		16 +
		user.sprite.x -
		window.scene.cameras.main.scrollX -
		(bubbleRef.current ? bubbleRef.current.clientWidth / 2 : 0)
	// console.log(left)
	// console.log(
	// 	user.x,
	// 	bubbleRef.current ? bubbleRef.current.clientWidth : false
	// )
	const top = user.sprite.y - window.scene.cameras.main.scrollY
	const bottom = window.innerHeight - top + 5
	return (
		<>
			{show && (
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
						visibility: visible ? "visible" : "hidden",
						wordWrap: "break-word",
						whiteSpace: "pre-wrap",
					}}
				>
					{user.lastWord}
				</div>
			)}
		</>
	)
}

export default ChatBubble
