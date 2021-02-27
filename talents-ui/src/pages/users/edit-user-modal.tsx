import { InfoCircleFilled, SaveFilled } from "@ant-design/icons";
import { Alert, Button, Checkbox, Divider, Form, FormInstance, Input, message, Modal, Skeleton, Tooltip, Tree } from "antd";
import React, { Component } from "react";
import { IAlertModel } from "../../models/IAlertModel";
import { ICreateUpdateUserModel } from "../../models/user/ICreateUpdateUserModel";
import { ICreateUpdateUserRoleItem } from "../../models/user/ICreateUpdateUserRoleItem";
import UserService from "../../services/user-service";


interface IProps {
    id: number,
    show: boolean,
    onClose: () => void,
    onOk: () => void,
    onSuccess: () => void
}

interface IState {
    isLoading: boolean,
    alert: IAlertModel,
    roles: Array<ICreateUpdateUserRoleItem>,
    setRandomPassword: boolean,
    showSpinner: boolean
}

export default class EditUserModal extends Component<IProps, IState>{
    formRef = React.createRef<FormInstance>();
    state = {
        showSpinner: false,
        isLoading: false,
        alert: {
            show: false,
            message: '',
            isSuccess: false
        },
        roles: [],
        setRandomPassword: false
    }

    componentDidMount = async () => {
        await this._loadData();
    }

    _loadData = async () => {
        this.setState({ isLoading: true, showSpinner: true });
        try {
            const result = await UserService.getById(this.props.id);
            this.setState({ showSpinner: false });
            if (result.isSuccess) {
                this.setState({ roles: result.data.roles });
                const roles: Array<number> = result.data.roles.map((r: ICreateUpdateUserRoleItem) => {
                    if (r.isChecked) return r.roleId;
                });
                this.formRef.current?.setFieldsValue({ ...result.data, roles });
            }
            else {
                message.error(result.message);
                this.setState({ alert: { show: true, message: result.message, isSuccess: false } });
            }
        }
        catch (error) {
            message.error("An error occured while processing request");
            this.setState({ alert: { show: true, message: "An error occured while processing request", isSuccess: false } });
        }
        this.setState({ isLoading: false });
    }

    _onFinish = async (values: any) => {
        this.setState({ isLoading: true });
        try {
            var roles: Array<ICreateUpdateUserRoleItem> = [];
            if (values.roles) {
                values.roles.forEach((r: number) => roles.push({ roleId: r, name: '', isChecked: true }));
            }

            var data: ICreateUpdateUserModel = { ...values, roles };
            data.id = this.props.id;
            const result = await UserService.update(data);
            if (result.isSuccess) {
                message.success("User updated.");
                this.props.onSuccess();
            }
            else {
                message.error(result.message);
                this.setState({ alert: { show: true, message: result.message, isSuccess: false } });
            }
        }
        catch (error) {
            message.error("An error occured");
        }
        this.setState({ isLoading: false });
    }

    _toggleSetRandomPassword = (setRandomPassword: boolean) => this.setState({ setRandomPassword });

    render() {
        return (
            <>
                <Modal
                    maskClosable={false}
                    title="Edit user"
                    visible={this.props.show}
                    onOk={this.props.onOk}
                    onCancel={this.props.onClose}
                    footer={
                        [
                            <Button key="back" onClick={this.props.onClose}>
                                Cancel
                            </Button>,
                            <Button icon={<SaveFilled />} form="editUserForm" htmlType="submit" key="submit" type="primary" loading={this.state.isLoading} onClick={this.props.onOk}>
                                Save
                            </Button>,
                        ]
                    }>
                    {this.state.showSpinner ?
                        <Skeleton active /> :
                        <fieldset disabled={this.state.isLoading}>
                            <Form
                                ref={this.formRef}
                                id="editUserForm"
                                layout="vertical"
                                initialValues={{
                                    isActive: false,
                                    setRandomPassword: false,
                                    shouldSetPasswordOnNextLogin: false,
                                    sendActivationEmail: false,
                                    isLockOutEnabled: false,
                                    emailVerificationRequired: false,
                                    roles: []
                                }}
                                onFinish={this._onFinish}>
                                {this.state.alert.show && <Alert type={this.state.alert.isSuccess ? 'success' : 'error'} message={this.state.alert.message} />}
                                <p></p>
                                <Form.Item
                                    label="First name"
                                    name="firstName"
                                    rules={[{ required: true, message: 'Please provide first name' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Last name"
                                    name="lastName"
                                    rules={[{ required: true, message: 'Please provide last name' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    label="Email address"
                                    name="email"
                                    rules={[{ required: true, message: 'Please provide email address' }]}>
                                    <Input type="email" />
                                </Form.Item>

                                <Divider orientation="center">ROLES</Divider>
                                <Form.Item
                                    label="Roles"
                                    name="roles">
                                    <Checkbox.Group>
                                        {this.state.roles.map((r: ICreateUpdateUserRoleItem) =>
                                            <Checkbox key={r.roleId} value={r.roleId}>{r.name}</Checkbox>
                                        )}
                                    </Checkbox.Group>
                                </Form.Item>

                                <Divider />
                                <Form.Item name="setRandomPassword" valuePropName="checked">
                                    <Checkbox onChange={e => this._toggleSetRandomPassword(e.target.checked)}>Set random password</Checkbox>
                                </Form.Item>
                                {!this.state.setRandomPassword &&
                                    <>
                                        <Form.Item
                                            label="Password"
                                            name="password"
                                            rules={[
                                                { message: 'Please input your password!' }
                                            ]}>
                                            <Input.Password autoComplete="new-password" />
                                        </Form.Item>
                                        <Form.Item
                                            label="Re type password"
                                            name="reTypePassword"
                                            rules={[
                                                { message: 'Please re-type your password!' },
                                                ({ getFieldValue }) => ({
                                                    validator(rule, value) {
                                                        if (!value || getFieldValue('password') === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject('The two passwords that you entered do not match!');
                                                    },
                                                }),
                                            ]}>
                                            <Input.Password autoComplete="new-password" />
                                        </Form.Item>
                                    </>
                                }
                                <Form.Item name="shouldSetPasswordOnNextLogin" valuePropName="checked">
                                    <Checkbox>Should change password on next login</Checkbox>
                                </Form.Item>
                                <Form.Item name="sendActivationEmail" valuePropName="checked">
                                    <Checkbox>Send activation email</Checkbox>
                                </Form.Item>
                                <Form.Item name="isLockOutEnabled" valuePropName="checked">
                                    <Checkbox>
                                        Lockout enabled
                                        <Tooltip title="Locks the user account after 3 invalid login attempts"><InfoCircleFilled className="info-icon-tooltip" /></Tooltip>
                                    </Checkbox>
                                </Form.Item>
                                <Form.Item name="isActive" valuePropName="checked">
                                    <Checkbox>Active</Checkbox>
                                </Form.Item>
                                <Form.Item name="emailVerificationRequired" valuePropName="checked">
                                    <Checkbox>
                                        Email verification required
                                        <Tooltip title="Allows the user to login without verifying their email address"><InfoCircleFilled className="info-icon-tooltip" /></Tooltip>
                                    </Checkbox>
                                </Form.Item>
                            </Form>
                        </fieldset>
                    }
                </Modal>
            </>
        )
    }
}