import { SaveFilled } from "@ant-design/icons";
import { Alert, Button, Form, FormInstance, Input, message, Modal, Tree } from "antd";
import React, { Component } from "react";
import { IAlertModel } from "../../models/IAlertModel";
import { ICreateUpdateUserRoleModel } from "../../models/user-role/ICreateUpdateUserRoleModel";
import { IUserRoleModel } from "../../models/user-role/IUserRoleModel";
import UserRoleService from "../../services/user-role-service";

interface IProps {
    id: number,
    show: boolean,
    onClose: () => void,
    onOk: () => void,
    onSuccess: () => void
}

interface IState {
    isLoading: boolean,
    isLoadingTree: boolean,
    alert: IAlertModel,
    data: IUserRoleModel,
    allPermissions: any
}

export default class EditRoleModal extends Component<IProps, IState>{
    formRef = React.createRef<FormInstance>();
    state = {
        isLoading: false,
        isLoadingTree: false,
        alert: {
            show: false,
            message: '',
            isSuccess: false
        },
        data: {
            id: 0,
            name: '',
            companyId: 0,
            isDefault: false,
            dateCreated: new Date,
            permission: '',
            permissionList: []
        },
        allPermissions: []
    }

    componentDidMount = async () => {
        await this._loadData();
    }

    _loadData = async () => {
        this.setState({ isLoading: true, isLoadingTree: true });
        try {
            const data = await UserRoleService.getById(this.props.id);
            const allPermissions = await UserRoleService.getAllPermissionsForTreeView();
            this.setState({ data, allPermissions });
            this.formRef.current?.setFieldsValue({ ...data });
        }
        catch (error) {
            message.error("An error occured");
        }
        this.setState({ isLoading: false, isLoadingTree: false });
    }

    _onFinish = async (values: any) => {
        this.setState({ isLoading: true });
        try {
            var data: ICreateUpdateUserRoleModel = values;
            data.id = this.props.id;
            data.grantedPermissions = this.state.data.permissionList;
            const result = await UserRoleService.update(data);
            if (result.isSuccess) {
                message.success("User role updated.");
                // this.setState({ alert: { show: true, message: `User role successfully updated`, isSuccess: true } });
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

    _selectPermissions = async (permissionList: any) => {
        this.setState({ data: { ...this.state.data, permissionList } });
    }

    render() {
        return (
            <>
                <Modal
                    maskClosable={false}
                    title="Edit role"
                    visible={this.props.show}
                    onOk={this.props.onOk}
                    onCancel={this.props.onClose}
                    footer={
                        [
                            <Button key="back" onClick={this.props.onClose}>
                                Cancel
                            </Button>,
                            <Button icon={<SaveFilled />} form="editRoleForm" htmlType="submit" key="submit" type="primary" loading={this.state.isLoading} onClick={this.props.onOk}>
                                Save changes
                            </Button>,
                        ]
                    }>
                    <Form
                        ref={this.formRef}
                        id="editRoleForm"
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
                                    selectedKeys={this.state.data.permissionList}
                                    checkedKeys={this.state.data.permissionList}
                                    onCheck={this._selectPermissions}
                                    treeData={this.state.allPermissions}
                                />
                            }
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        )
    }
}