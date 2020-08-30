import React, { useState, useEffect } from "react"

function NearbyUsers({ user }) {
	// only users nearby
	const [users, setUsers] = useState([user])
	window.setNearbyUsers = setUsers
	return (
		<span style={{ position: "absolute" }}>
			{users.map((u) => (
				<span key={u.id}>{u.id} </span>
			))}
		</span>
	)
}

export default NearbyUsers
