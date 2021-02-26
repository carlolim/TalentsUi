import { SaveFilled } from "@ant-design/icons";
import { Alert, Button, Form, Input, message, Modal, Tree } from "antd";
import React, { Component } from "react";
import { IAlertModel } from "../../models/IAlertModel";
import { ICreateUpdateUserRoleModel } from "../../models/user-role/ICreateUpdateUserRoleModel";
import UserRoleService from "../../services/user-role-service";

interface IProps {
    show: boolean,
    onClose: () => void,
    onOk: () => void,
    onSuccess: () => void
}

interface IState {
    isLoading: boolean,
    alert: IAlertModel,
    isLoadingTree: boolean,
    allPermissions: any,
    selectedPermissions: Array<string>
}

export default class CreateUserModal extends Component<IProps, IState>{
    state = {
        isLoading: false,
        alert: {
            show: false,
            message: '',
            isSuccess: false
        },
        isLoadingTree: false,
        allPermissions: [],
        selectedPermissions: []
    }

    componentDidMount = async () => {
        await this._loadData();
    }

    _loadData = async () => {
        this.setState({ isLoading: true, isLoadingTree: true });
        try {
            const allPermissions = await UserRoleService.getAllPermissionsForTreeView();
            this.setState({ allPermissions });
        }
        catch (error) {
            message.error("An error occured");
        }
        this.setState({ isLoading: false, isLoadingTree: false });
    }

    _onFinish = async (values: any) => {
        this.setState({ isLoading: true });
        try {
            var data: ICreateUpdateUserRoleModel = {
                grantedPermissions: this.state.selectedPermissions,
                id: 0,
                isDefault: values.isDefault,
                name: values.name
            };
            const result = await UserRoleService.create(data);
            if (result.isSuccess) {
                message.success("User role added.");
                // this.setState({ alert: { show: true, message: `User role successfully added`, isSuccess: true } });
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

    _selectPermissions = async (selectedPermissions: any) => {
        this.setState({ selectedPermissions });
    }

    render() {
        return (
            <>
                <Modal
                    maskClosable={false}
                    title="Create new role"
                    visible={this.props.show}
                    onOk={this.props.onOk}
                    onCancel={this.props.onClose}
                    footer={
                        [
                            <Button key="back" onClick={this.props.onClose}>
                                Cancel
                            </Button>,
                            <Button icon={<SaveFilled />} form="createRoleForm" htmlType="submit" key="submit" type="primary" loading={this.state.isLoading} onClick={this.props.onOk}>
                                Save
                            </Button>,
                        ]
                    }>
                    <fieldset disabled={this.state.isLoading}>
                        <Form
                            id="createRoleForm"
                            layout="vertical"
                            onFinish={this._onFinish}>
                            {this.state.alert.show && <Alert type={this.state.alert.isSuccess ? 'success' : 'error'} message={this.state.alert.message} />}
                            <p></p>
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Please provide role name' }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Permissions">
                                {!this.state.isLoadingTree &&
                                    <Tree
                                        showLine
                                        checkable
                                        defaultExpandAll
                                        selectedKeys={this.state.selectedPermissions}
                                        checkedKeys={this.state.selectedPermissions}
                                        onCheck={this._selectPermissions}
                                        treeData={this.state.allPermissions}
                                    />
                                }
                            </Form.Item>
                        </Form>
                    </fieldset>
                </Modal>
            </>
        )
    }
}