import React, { Component } from "react";
import moment from "moment";
import { Button, Dropdown, Menu, message, Modal, Space, Spin, Table, Tag } from "antd";
import { DeleteFilled, DownOutlined, EditFilled, PlusOutlined } from "@ant-design/icons";
import "./style.css";
import { DATETIME_FORMAT } from "../../models/constants";
import Search from "antd/lib/input/Search";
import EditUserModal from "./edit-user-modal";
import CreateUserModal from "./create-user-modal";
import { IUserModel } from "../../models/user/IUserModel";
import UserService from "../../services/user-service";

interface IState {
    isLoading: boolean,
    data: Array<IUserModel>,
    showAdd: boolean,
    showEdit: boolean,
    selectedId: number
}
export default class Users extends Component<{}, IState> {
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
            render: (text: string, row: IUserModel) => <Button type="link" onClick={() => this._toggleEdit(true, row.id)}>{row.firstName} {row.lastName}</Button>,
        },
        {
            title: 'Date created',
            dataIndex: 'dateCreated',
            key: 'dateCreated',
            render: (text: Date) => moment(text).format(DATETIME_FORMAT),
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: (text: Array<string>) => text.map(t => <Tag color="blue" key={t} title={t} />),
        },
        {
            title: 'Email verified',
            dataIndex: 'isEmailVerified',
            key: 'isEmailVerified',
            render: (text: boolean) => text ? <Tag color="green" title="Yes" /> : <Tag color="red" title="No" />,
        },
        {
            title: 'Action',
            key: '',
            dataIndex: '',
            render: (data: any, row: IUserModel) =>
                <Dropdown
                    overlay={
                        <>
                            <Menu>
                                <Menu.Item key="0">
                                    <Button onClick={() => this._toggleEdit(true, row.id)} type="link" icon={<EditFilled />}>Edit</Button>
                                </Menu.Item>
                                <Menu.Item key="1">
                                    <Button onClick={() => this._delete(row.id)} type="link" danger icon={<DeleteFilled />}>Delete</Button>
                                </Menu.Item>
                            </Menu>
                        </>
                    }
                    trigger={['click']}>
                    <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                        Action <DownOutlined />
                    </a>
                </Dropdown>
            ,
        },
    ]

    componentDidMount = async () => await this._loadData();

    _loadData = async (search?: string) => {
        this.setState({ isLoading: true });
        const data = await UserService.getAll(search);
        this.setState({ data, isLoading: false });
    }

    _toggleEdit = async (showEdit: boolean, selectedId: number) => this.setState({ showEdit, selectedId })
    _toggleAdd = async (showAdd: boolean) => this.setState({ showAdd })
    _onSearch = async (str: string) => await this._loadData(str);

    _onCretionSuccess = async () => {
        this._toggleAdd(false);
        await this._loadData();
    }
    _onEditSuccess = async () => {
        this._toggleEdit(false, 0);
        await this._loadData();
    }

    _delete = (id: number) => {
        Modal.confirm({
            title: "Delete?",
            content: this.state.isLoading ? <div className="text-center"><Spin /></div> : <></>,
            onOk: async () => {
                this.state.isLoading = true;
                const result = await UserService.delete(id);
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
                <h3>Users</h3>

                <Search placeholder="Name, Email" onSearch={this._onSearch} enterButton allowClear />
                <div style={{ height: 25 }}></div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => this._toggleAdd(true)}>Add new</Button>
                <p></p>
                <Table
                    loading={this.state.isLoading}
                    columns={this.columns}
                    rowKey="id"
                    dataSource={this.state.data} />

                {this.state.showAdd &&
                    <CreateUserModal
                        onClose={() => this._toggleAdd(false)}
                        onOk={() => { }}
                        show={this.state.showAdd}
                        onSuccess={this._onCretionSuccess}
                    />}

                {this.state.showEdit &&
                    <EditUserModal
                        id={this.state.selectedId}
                        onClose={() => this._toggleEdit(false, 0)}
                        onOk={() => { }}
                        show={this.state.showEdit}
                        onSuccess={this._onEditSuccess}
                    />}
            </>
        );
    }
}
