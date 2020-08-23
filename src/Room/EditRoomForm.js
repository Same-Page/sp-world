import React, { useState } from "react"

import { Form, Input, Button } from "antd"

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
// const buttonItemLayout = {
// 	wrapperCol: { span: 14, offset: 4 },
// }

function EditRoomForm({ roomId, roomInfo }) {
	const [submitting, setSubmitting] = useState(false)
	const submitForm = (data) => {
		// console.log(data)
		data.id = roomId
		window.socket.emit("update room", data)
		setSubmitting(true)
	}
	return (
		<Form
			// className="sp-form"
			{...formItemLayout}
			labelAlign="left"
			// form={form}
			name="sp-create-room"
			onFinish={submitForm}
			initialValues={{
				name: roomInfo && roomInfo.name,
				about: roomInfo && roomInfo.about,
			}}
			scrollToFirstError
		>
			<p>
				看来你发现了一个还没有主题的房间呢！先来设置一下该房间的主题吧，比如一起看某部电视剧，某部电影，或者聊聊某个具体话题？
			</p>
			<Form.Item
				name="name"
				label="房间名称（必填）"
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
				label="介绍（必填）"
				hasFeedback
				rules={[
					{
						required: true,
						message: "请填写房间介绍",
					},
				]}
			>
				<Input />
			</Form.Item>
			<Form.Item
				name="url"
				label="网址"
				hasFeedback
				rules={[
					{
						message: "请填写网址",
					},
				]}
			>
				<Input />
			</Form.Item>
			<Form.Item
				name="iframe"
				label="内嵌iframe"
				hasFeedback
				rules={[
					{
						// message: "请填写网址",
					},
				]}
			>
				<Input placeholder="目标网站提供的内嵌iframe src的地址" />
			</Form.Item>
			<Form.Item
			//  {...buttonItemLayout}
			>
				<Button loading={submitting} type="primary" htmlType="submit">
					提交
				</Button>
			</Form.Item>
		</Form>
	)
}
export default EditRoomForm
