import axiosInstance from './axiosInstance';
import pluginId from "../pluginId";

const fetchContentTypes = async (token) => {
  if (!token) {
    return null;
  }
  try {
    const { data } = await axiosInstance.get(`${pluginId}/content-types`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    return null;
  }
};

const fetchCollection = async (uid, token) => {
  if (!token) {
    return null;
  }
  try {
    const { data } = await axiosInstance.get(`${pluginId}/${uid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    return null;
  }
};

const vote = async (uid, id) => {
  try {
    const { data } = await axiosInstance.post(`${pluginId}/${uid}:${id}/vote`);
    return data;
  } catch (error) {
    console.log('ERROR', error);
  }
};

export {
  fetchContentTypes,
  fetchCollection,
  vote
};
