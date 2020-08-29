import "./Room.css"
import React, { useState, useEffect } from "react"
import { message, Modal, Collapse } from "antd"

import TextMessaging from "./TextMessaging"
import Users from "./Users"
import EditRoomForm from "./EditRoomForm"
const { Panel } = Collapse

function Room({ user, socket }) {
	// const user = window.user
	useEffect(() => {
		if (window.isMobile) {
			message.warn("暂时不支持手机使用，请使用电脑")
		}
	}, [])
	const [showRoomInfo, setShowRoomInfo] = useState(false)
	const [roomInfo, setRoomInfo] = useState()
	const [roomId, setRoomId] = useState()
	const showRoomModal = ({ id, data }) => {
		// {id: <room id>, data: <occupy info>}
		setRoomInfo(data)
		setRoomId(id)
		setShowRoomInfo(true)
	}
	window.showRoomModal = showRoomModal

	const title = roomInfo ? roomInfo.name : "无主题房间"

	return (
		<>
			{showRoomInfo && (
				<Modal
					// mask={false}
					// maskClosable={false}
					footer={null}
					title={title}
					visible={true}
					width={roomInfo ? 720 : 480}
					bodyStyle={{ padding: roomInfo ? 0 : 24 }}
					// visible={showRoomInfo}
					//   onOk={this.handleOk}

					onCancel={() => {
						setShowRoomInfo(false)
					}}
				>
					{roomInfo && (
						<>
							<Collapse
								// ghost
								defaultActiveKey={[
									"about",
									"iframe",
									"users",
									"chat",
								]}
								// bordered={false}
								// onChange={callback}
							>
								<Panel header="房间介绍" key="about">
									<span>{roomInfo.about}</span>

									{roomInfo.url && (
										<p>
											网址:{" "}
											<a
												target="_blank"
												href={roomInfo.url}
											>
												{roomInfo.url}
											</a>
										</p>
									)}
								</Panel>

								{roomInfo.iframe && (
									<Panel header="播放器" key="iframe">
										<iframe
											allowFullScreen
											style={{
												width: "100%",
												height: "400px",
												border: "none",
												// margin: "15px auto",
											}}
											src={roomInfo.iframe}
										/>
									</Panel>
								)}
								<Panel header="在线用户" key="users">
									<Users user={user} socket={socket} />
								</Panel>
								<Panel header="聊天" key="chat">
									<TextMessaging
										user={user}
										socket={socket}
									/>
								</Panel>
							</Collapse>
						</>
					)}
					{/* TODO: option to update room */}
					{!roomInfo && (
						<EditRoomForm
							roomInfo={roomInfo}
							roomId={roomId}
							socket={socket}
						/>
					)}
				</Modal>
			)}
		</>
	)
}

export default Room
