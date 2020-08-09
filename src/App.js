import React, { useState } from "react"
import "./App.css"
import "antd/dist/antd.css"
import { Modal, Button } from "antd"

import Game from "./Game"
import Chat from "./Chat"

function App() {
	const [showRoomInfo, setShowRoomInfo] = useState(false)
	window.setShowRoomInfo = setShowRoomInfo
	return (
		<div className="App">
			<Modal
				// mask={false}
				// maskClosable={false}
				title="Basic Modal"
				visible={showRoomInfo}
				//   onOk={this.handleOk}
				onCancel={() => {
					setShowRoomInfo(false)
				}}
			>
				<p>Some contents...</p>
				<p>Some contents...</p>
				<p>Some contents...</p>
			</Modal>

			<Game />
			<Chat />
		</div>
	)
}

export default App
