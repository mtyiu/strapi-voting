import pluginId from "../../../pluginId";
import { axiosInstance, handleAPIError } from '../../../utils';

export const setToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

export const fetchConfig = async (toggleNotification, token) => {
  try {
    const { data } = await axiosInstance.get(`/${pluginId}/settings/config`);
    return data;
  } catch (error) {
    handleAPIError(error, toggleNotification);
  }
};

export const updateConfig = async (body, toggleNotification) => {
  try {
    const { data } = await axiosInstance.put(`/${pluginId}/settings/config`, body);
    return data;
  } catch (error) {
    handleAPIError(error, toggleNotification);
  }
};

export const restoreConfig = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.delete(`/${pluginId}/settings/config`);
    return data;
  } catch (error) {
    handleAPIError(error, toggleNotification);
  }
};

export const restartStrapi = async (toggleNotification) => {
  try {
    const { data } = await axiosInstance.get(`/${pluginId}/settings/restart`);
    return data;
  } catch (error) {
    handleAPIError(error, toggleNotification);
  }
};
