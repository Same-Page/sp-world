import React, { useState, useEffect } from "react"
import { message } from "antd"
import Peer from "peerjs"

import User from "./NearbyUser"

async function getMedia(constraints) {
	let stream = null

	try {
		stream = await navigator.mediaDevices.getUserMedia(constraints)

		window.localStream = stream
	} catch (err) {
		console.error("Failed to get local stream", err)
		// alert(err)
		message.error("请允许使用麦克风")
		/* handle the error */
	}
	return stream
}
// https://github.com/peers/peerjs/issues/158
const createMediaStreamFake = () => {
	return new MediaStream([
		createEmptyAudioTrack(),
		createEmptyVideoTrack({ width: 640, height: 480 }),
	])
	// return new MediaStream([createEmptyAudioTrack()])
}

const createEmptyAudioTrack = () => {
	const ctx = new AudioContext()
	const oscillator = ctx.createOscillator()
	const dst = oscillator.connect(ctx.createMediaStreamDestination())
	oscillator.start()
	const track = dst.stream.getAudioTracks()[0]
	return Object.assign(track, { enabled: false })
}

const createEmptyVideoTrack = ({ width, height }) => {
	const canvas = Object.assign(document.createElement("canvas"), {
		width,
		height,
	})
	canvas.getContext("2d").fillRect(0, 0, width, height)

	const stream = canvas.captureStream()
	const track = stream.getVideoTracks()[0]

	return Object.assign(track, { enabled: false })
}

const fakeStream = createMediaStreamFake()
let myStream = fakeStream

function NearbyUsers({ user, socket }) {
	// only users nearby
	const [users, setUsers] = useState([user])
	const [peer, setPeer] = useState()
	const [selfStream, setSelfStream] = useState(fakeStream)
	const [streams, setStreams] = useState({})
	const turnOnSelfAudio = () => {
		getMedia({ audio: true }).then((localStream) => {
			console.log("got local stream")
			setSelfStream(localStream)
			myStream = localStream
			socket.emit("audio toggle", { on: true })
			// setLocalStream(stream)
			// users.forEach((u) => {
			// 	if (u.id === user.id) return
			// 	const call = peer.call(u.id, stream)
			// 	registerListenersOnStreamCall(call)
			// })
		})
	}
	window.turnOnSelfAudio = turnOnSelfAudio
	const registerListenersOnStreamCall = (call) => {
		call.on("stream", (remoteStream) => {
			console.log("received stream")
			setStreams((streams) => {
				return { ...streams, [call.peer]: remoteStream }
			})
		})

		call.on("close", () => {
			console.log("call closed")
		})
	}
	window.setNearbyUsers = (newRes) => {
		setUsers((users) => {
			return newRes
		})
	}
	useEffect(() => {
		const peer = new Peer(user.id)
		setPeer(peer)
		peer.on("call", (call) => {
			// console.log(call)
			console.log("received call")
			// console.log("self stream", selfStream)
			registerListenersOnStreamCall(call)
			call.answer(myStream)
		})
		return () => {
			peer.destroy()
		}
	}, [user])
	return (
		<>
			{peer && (
				<span style={{ position: "absolute" }}>
					{users.map((u) => (
						<User
							key={u.id}
							peer={peer}
							user={user}
							registerListenersOnStreamCall={
								registerListenersOnStreamCall
							}
							selfStream={selfStream}
							otherStream={streams[u.id]}
						/>
					))}
				</span>
			)}
		</>
	)
}

export default NearbyUsers
