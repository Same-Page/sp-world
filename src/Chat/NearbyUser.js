import React, { useState, useEffect } from "react"

function NearbyUser({
	user,
	peer,
	selfStream,
	registerListenersOnStreamCall,
	otherStream,
}) {
	useEffect(() => {
		console.log("call other", user.id, selfStream)
		const call = peer.call(user.id, selfStream)
		registerListenersOnStreamCall(call)
	}, [selfStream])
	console.log("otherStream", otherStream)
	return (
		<>
			{user.id}

			<audio
				autoPlay
				controls
				ref={(audio) => {
					if (audio) {
						audio.srcObject = otherStream
					}
				}}
			></audio>
		</>
	)
}
export default NearbyUser
