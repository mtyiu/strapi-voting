import axios from 'axios';
import pluginId from "../pluginId";

const fetchContentTypes = async () => {
  try {
    const { data } = await axios.get(`/${pluginId}/content-types`);
    return data;
  } catch (error) {
    return null;
  }
};

const fetchCollection = async (uid) => {
  console.log('[API] Strapi-Voting: fetchCollection', uid)
  try {
    const { data } = await axios.get(`/${pluginId}/${uid}`);
    return data;
  } catch (error) {
    return null;
  }
};

const vote = async (uid, id) => {
  console.log('[API] Strapi-Voting: vote', uid, id)
  try {
    const { data } = await axios.post(`/${pluginId}/${uid}:${id}/vote`);
    return data;
  } catch (error) {
    console.log('ERROR', error);
  }
};

export {
  fetchContentTypes,
  fetchCollection,
  vote
}
