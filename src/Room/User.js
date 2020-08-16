import React, { useState, useEffect } from "react"
import { Switch, Avatar } from "antd"
import { AudioFilled, AudioMutedOutlined } from "@ant-design/icons"

function User({ user, self, stream, turnOnSelfAudio, turnOffSelfAudio }) {
	return (
		<span
			style={{
				display: "inline-block",
				marginRight: 20,
				textAlign: "center",
			}}
		>
			<Avatar
				// size="large"
				title={user.id}
				src="https://avatars2.githubusercontent.com/u/164476?s=88&v=4"
			/>
			<br />
			{/* {!self && <span style={{ fontSize: 11 }}>{user.id}</span>} */}

			{user.audio && !self && (
				<>
					<audio
						autoPlay
						// controls
						ref={(audio) => {
							if (audio) {
								audio.srcObject = stream
							}
						}}
					></audio>

					<AudioFilled />
				</>
			)}
			{!user.audio && !self && <AudioMutedOutlined />}

			{self && (
				<Switch
					size="small"
					checkedChildren="开麦"
					unCheckedChildren="闭麦"
					onChange={(on) => {
						if (on) {
							turnOnSelfAudio()
						} else {
							turnOffSelfAudio()
						}
					}}
				/>
			)}
		</span>
	)
}

export default User
