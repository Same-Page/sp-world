import React, { useState, useEffect } from "react"

import Call from "./Call"
import TextMessaging from "./TextMessaging"
// const calls =  {}

function RoomChat({ user }) {
	// const [calls, setCalls] = useState([])

	return (
		<>
			<Call user={user} />

			<TextMessaging user={user} />
		</>
	)
}

export default RoomChat
