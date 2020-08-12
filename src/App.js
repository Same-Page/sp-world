import React, { useState, useEffect } from "react"
import "./App.css"
import "antd/dist/antd.css"

import Game from "./Game"
import Chat from "./Chat"
import Room from "./Room"

function App() {
	return (
		<div className="App">
			<Game />
			<Chat />
			<Room />
		</div>
	)
}

export default App
