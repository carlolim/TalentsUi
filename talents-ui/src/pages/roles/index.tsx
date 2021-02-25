import React, { Component } from "react";
import moment from "moment";
import { Button, message, Modal, Space, Spin, Table } from "antd";
import { DeleteFilled, EditFilled, PlusOutlined } from "@ant-design/icons";
import "./style.css";
import { DATETIME_FORMAT } from "../../models/constants";
import { IUserRoleModel } from "../../models/user-role/IUserRoleModel";
import Search from "antd/lib/input/Search";
import EditRoleModal from "./edit-role-modal";
import CreateRoleModal from "./create-role-modal";
import UserRoleService from "../../services/user-role-service";

interface IState {
    isLoading: boolean,
    data: Array<IUserRoleModel>,
    showAdd: boolean,
    showEdit: boolean,
    selectedId: number
}
export default class Roles extends Component<{}, IState> {
    state = {
        isLoading: false,
        data: [],
        showAdd: false,
        showEdit: false,
        selectedId: 0
    }

    columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, row: IUserRoleModel) => <Button type="link" onClick={() => this._toggleEditRole(true, row.id)}>{text}</Button>,
        },
        {
            title: 'Date created',
            dataIndex: 'dateCreated',
            key: 'dateCreated',
            render: (text: Date) => moment(text).format(DATETIME_FORMAT),
        },
        {
            title: 'Action',
            key: '',
            dataIndex: '',
            render: (data: any, row: IUserRoleModel) =>
                <Space>
                    <Button onClick={() => this._toggleEditRole(true, row.id)} type="primary" icon={<EditFilled />}>Edit</Button>
                    <Button onClick={() => this._delete(row.id)} type="primary" danger icon={<DeleteFilled />}>Delete</Button>
                </Space>
            ,
        },
    ]

    componentDidMount = async () => await this._loadData();

    _loadData = async (search?: string) => {
        this.setState({ isLoading: true });
        const data = await UserRoleService.getAll(search);
        this.setState({ data, isLoading: false });
    }

    _toggleEditRole = async (showEdit: boolean, selectedId: number) => this.setState({ showEdit, selectedId })
    _toggleAddRole = async (showAdd: boolean) => this.setState({ showAdd })
    _onSearch = async (str: string) => await this._loadData(str);

    _onCretionSuccess = async () => {
        this._toggleAddRole(false);
        await this._loadData();
    }
    _onEditSuccess = async () => {
        this._toggleEditRole(false, 0);
        await this._loadData();
    }

    _delete = (id: number) => {
        Modal.confirm({
            title: "Delete?",
            content: this.state.isLoading ? <div className="text-center"><Spin /></div> : <></>,
            onOk: async () => {
                this.state.isLoading = true;
                const result = await UserRoleService.delete(id);
                if (result.isSuccess) await this._loadData();
                else message.error(result.message);
                this.state.isLoading = false;
            },
            okButtonProps: { loading: this.state.isLoading },
            cancelButtonProps: { loading: this.state.isLoading },
            keyboard: false
        });
    }

    render() {
        return (
            <>
                <h3>Roles and Permissions</h3>

                <Search placeholder="Role name" onSearch={this._onSearch} enterButton allowClear />
                <div style={{ height: 25 }}></div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => this._toggleAddRole(true)}>Add new</Button>
                <p></p>
                <Table
                    loading={this.state.isLoading}
                    columns={this.columns}
                    rowKey="id"
                    dataSource={this.state.data} />

                {this.state.showAdd &&
                    <CreateRoleModal
                        onClose={() => this._toggleAddRole(false)}
                        onOk={() => { }}
                        show={this.state.showAdd}
                        onSuccess={this._onCretionSuccess}
                    />}

                {this.state.showEdit &&
                    <EditRoleModal
                        id={this.state.selectedId}
                        onClose={() => this._toggleEditRole(false, 0)}
                        onOk={() => { }}
                        show={this.state.showEdit}
                        onSuccess={this._onEditSuccess}
                    />}
            </>
        );
    }
}
