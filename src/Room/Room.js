import "./Room.css"
import React, { useState, useEffect } from "react"

import { Form, Input, Upload, message, Modal, Button } from "antd"
const formItemLayout = {
	labelCol: {
		xs: {
			span: 24,
		},
		sm: {
			span: 24, // always separate lines
		},
	},
	wrapperCol: {
		xs: {
			span: 24,
		},
		sm: {
			span: 24,
		},
	},
}
const buttonItemLayout = {
	wrapperCol: { span: 14, offset: 4 },
}

function Room() {
	const [showRoomInfo, setShowRoomInfo] = useState(false)
	const [roomInfo, setRoomInfo] = useState()
	// {id: <room id>, data: <occupy info>}
	const [submitting, setSubmitting] = useState(false)
	const showRoomModal = (room) => {
		console.log(room)
		setRoomInfo(room)
		setShowRoomInfo(true)
		setSubmitting(false)
	}
	window.showRoomModal = showRoomModal
	// window.roomUpdated = () => {
	// 	setSubmitting(false)
	// }
	const submitForm = (data) => {
		// console.log(data)
		data.id = roomInfo.id
		window.socket.emit("update room", data)
		setSubmitting(true)
	}

	const roomData = roomInfo && roomInfo.data
	const title = roomData ? roomData.name : "无主题房间"

	return (
		<Modal
			// mask={false}
			// maskClosable={false}
			footer={null}
			title={title}
			visible={showRoomInfo}
			//   onOk={this.handleOk}
			onCancel={() => {
				setShowRoomInfo(false)
			}}
		>
			{!roomData && (
				<Form
					// className="sp-form"
					{...formItemLayout}
					labelAlign="left"
					// form={form}
					name="sp-create-room"
					onFinish={submitForm}
					// initialValues={{
					// 	name: room && room.name,
					// 	about: room && room.about,
					// }}
					scrollToFirstError
				>
					<Form.Item
						name="name"
						label="名称"
						hasFeedback
						rules={[
							{
								required: true,
								message: "请填写房间名",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name="about"
						label="介绍"
						hasFeedback
						rules={[
							{
								// required: true,
								message: "请填写房间介绍",
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
					//  {...buttonItemLayout}
					>
						<Button
							loading={submitting}
							type="primary"
							htmlType="submit"
						>
							提交
						</Button>
					</Form.Item>
				</Form>
			)}
		</Modal>
	)
	// return <div className="room-wall">半泽直树2</div>
}

export default Room
