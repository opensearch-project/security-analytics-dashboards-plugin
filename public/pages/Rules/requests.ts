import axios from 'axios';

export const getRules: any = async () => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      const res = await axios.get('http://localhost:9999');
      return res.data;
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log('NOT DEV');
  }
};
