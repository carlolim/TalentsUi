import axios from "axios";
import { LOCALSTORAGE } from "../models/constants";
import { IResultModel } from "../models/IResultModel";
import { ICreateUpdateUserModel } from "../models/user/ICreateUpdateUserModel";
import { IUserModel } from "../models/user/IUserModel";

export default class UserService {
    static create = async (data: ICreateUpdateUserModel): Promise<IResultModel> => {
        return new Promise((resolve, reject) => {
            axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/user`, data,
                {
                    headers: {
                        "Authorization": `bearer ${localStorage.getItem(LOCALSTORAGE.TOKEN)}`
                    }
                })
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    static update = async (data: ICreateUpdateUserModel): Promise<IResultModel> => {
        return new Promise((resolve, reject) => {
            axios.put(`${process.env.REACT_APP_API_ENDPOINT}/api/user`, data,
                {
                    headers: {
                        "Authorization": `bearer ${localStorage.getItem(LOCALSTORAGE.TOKEN)}`
                    }
                })
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    static delete = async (id: number): Promise<IResultModel> => {
        return new Promise((resolve, reject) => {
            axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/api/user/${id}`,
                {
                    headers: {
                        "Authorization": `bearer ${localStorage.getItem(LOCALSTORAGE.TOKEN)}`
                    }
                })
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    static getById = async (id: number): Promise<IUserModel> => {
        return new Promise((resolve, reject) => {
            axios.get(`${process.env.REACT_APP_API_ENDPOINT}/api/user/${id}`,
                {
                    headers: {
                        "Authorization": `bearer ${localStorage.getItem(LOCALSTORAGE.TOKEN)}`
                    }
                })
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    static getAll = async (search?: string): Promise<Array<IUserModel>> => {
        var url = `${process.env.REACT_APP_API_ENDPOINT}/api/user`;
        if (search !== '' && search !== undefined && search !== null)
            url += `?search=${search}`;

        return new Promise((resolve, reject) => {
            axios.get(url,
                {
                    headers: {
                        "Authorization": `bearer ${localStorage.getItem(LOCALSTORAGE.TOKEN)}`
                    }
                })
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }

    static toggleLock = async (id: number, isLocked: boolean): Promise<IResultModel> => {
        return new Promise((resolve, reject) => {
            axios.post(`${process.env.REACT_APP_API_ENDPOINT}/api/user/togglelock`, { id, isLocked },
                {
                    headers: {
                        "Authorization": `bearer ${localStorage.getItem(LOCALSTORAGE.TOKEN)}`
                    }
                })
                .then(function (response) {
                    resolve(response.data);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    }
}