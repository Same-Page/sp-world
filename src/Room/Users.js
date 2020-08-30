import React, { useState, useEffect } from "react"
import { message } from "antd"
// import { AudioMutedOutlined, AudioOutlined } from "@ant-design/icons"

import Peer from "peerjs"

import User from "./User"

async function getMedia(constraints) {
	let stream = null

	try {
		stream = await navigator.mediaDevices.getUserMedia(constraints)
		// setLocalStream(stream)
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
let myStream = null
function Call({ user, socket }) {
	const [users, setUsers] = useState([user])
	const [peer, setPeer] = useState()
	const [streams, setStreams] = useState({})

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
	const turnOnSelfAudio = () => {
		getMedia({ audio: true }).then((stream) => {
			console.log("got local stream")
			myStream = stream
			socket.emit("audio toggle", { on: true })
			// setLocalStream(stream)
			users.forEach((u) => {
				if (u.id === user.id) return
				const call = peer.call(u.id, stream)
				registerListenersOnStreamCall(call)
			})
		})
	}

	const turnOffSelfAudio = () => {
		if (myStream) {
			myStream.getTracks()[0].stop()
			myStream = null
		}
		socket.emit("audio toggle", { on: false })
	}

	useEffect(() => {
		const peer = new Peer(user.id)
		setPeer(peer)
		peer.on("call", (call) => {
			// console.log(call)
			console.log("received call")
			registerListenersOnStreamCall(call)
			call.answer(myStream || fakeStream)
		})

		const otherUserAudioToggleHandler = (other) => {
			setUsers((users) => {
				users = users.filter((u) => {
					return u.id !== other.id
				})

				return [...users, other]
			})
		}

		const otherLeftRoomHandler = (other) => {
			setUsers((users) => {
				const res = users.filter((u) => {
					return u.id !== other.id
				})
				return res
			})
		}

		const otherEnterRoomHandler = (newUser) => {
			// when other user join room
			// as an existing user, call this new user

			const call = peer.call(newUser.id, myStream || fakeStream)
			// console.log("making call", call)

			registerListenersOnStreamCall(call)
			setUsers((users) => {
				users = users.filter((u) => {
					return u.id !== newUser.id
				})

				return [...users, newUser]
			})
		}

		const userInRoomHandler = (users) => {
			setUsers(users)
		}
		socket.on("left room", otherLeftRoomHandler)
		socket.on("users in room", userInRoomHandler)
		socket.on("audio toggle", otherUserAudioToggleHandler)
		socket.on("enter room", otherEnterRoomHandler)

		return () => {
			console.log("destroy peer")

			peer.destroy()
			if (myStream) {
				myStream.getTracks()[0].stop()
			}
			socket.emit("audio toggle", { on: false })

			socket.off("left room", otherLeftRoomHandler)
			socket.off("users in room", userInRoomHandler)
			socket.off("audio toggle", otherUserAudioToggleHandler)
			socket.off("enter room", otherEnterRoomHandler)
			// setCalls([])
		}
	}, [user, socket])

	return (
		<>
			{users.map((u) => (
				<User
					user={u}
					key={u.id}
					self={String(u.id) === String(user.id)}
					stream={streams[u.id]}
					turnOnSelfAudio={turnOnSelfAudio}
					turnOffSelfAudio={turnOffSelfAudio}
				/>
			))}
		</>
	)
}

export default Call
